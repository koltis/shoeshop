import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Link, useActionData } from "@remix-run/react";
import { JwtPayload } from "jsonwebtoken";
import { z } from "zod";

import { validateSignedToken } from "~/models/jwt.server";
import { createUser, getUserByEmail } from "~/models/user.server";
import { getUserId } from "~/session.server";

const schema = z
  .object({
    password: z.string().min(6).max(20),
    repeatPassword: z.string().min(6).max(20),
  })
  .refine(({ password, repeatPassword }) => password === repeatPassword, {
    message: "Both passwords should match",
    path: ["repeatPassword"], // path of error
  });

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  const url = new URL(request.url);
  const join_token = url.searchParams.get("join_token");
  if (!join_token) return redirect("/join");

  const validated = validateSignedToken(join_token);

  if (!validated) return redirect("/join");

  return json({ join_token: "verified" });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const returnObject: {
    errors: {
      password: string | undefined;
      repeatPassword: string | undefined;
      generic: undefined | string;
    };
    success: null | string;
  } = {
    errors: {
      password: undefined,
      repeatPassword: undefined,
      generic: undefined,
    },
    success: null,
  };
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  const url = new URL(request.url);
  const join_token = url.searchParams.get("join_token");

  if (!join_token) return redirect("/join");

  const validated = validateSignedToken(join_token) as JwtPayload;

  const email = validated.email as string;

  if (!email) {
    return redirect("/join");
  }

  if (!validated) return redirect("/join");

  if (submission.status !== "success") {
    return json(
      {
        ...returnObject,
        errors: {
          ...returnObject.errors,
          password: submission.error?.password
            ? submission.error?.password[0]
            : undefined,
          repeatPassword: submission?.error?.repeatPassword
            ? submission?.error?.repeatPassword[0]
            : undefined,
        },
      },
      { status: 400 },
    );
  }

  const userAlreadyExists = await getUserByEmail(email);

  if (userAlreadyExists) {
    returnObject.errors.generic = "The email is already in use";
    return json(
      {
        ...returnObject,
      },
      { status: 400 },
    );
  }

  const newUser = await createUser(email, submission.value.password);

  if (!newUser) {
    returnObject.errors.generic = "The email is already in use";
    return json(
      {
        ...returnObject,
      },
      { status: 500 },
    );
  }

  return json(
    {
      ...returnObject,
      success: "User successfully registered",
    },
    { status: 200 },
  );
};

export default function Register() {
  const actionData = useActionData<typeof action>();
  const [form, { password, repeatPassword }] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldValidate: "onInput",
  });

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <form
          method="post"
          id={form.id}
          className="space-y-6"
          onSubmit={form.onSubmit}
        >
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                type="password"
                name={password.name}
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.password || password.errors?.length ? (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData?.errors?.password}
                  {password?.errors?.length ? password?.errors[0] : ""}
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <label
              htmlFor="repeatPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Repeat password
            </label>
            <div className="mt-1">
              <input
                type="password"
                name={repeatPassword.name}
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.repeatPassword ||
              repeatPassword.errors?.length ? (
                <div className="pt-1 text-red-700" id="repeatPassword-error">
                  {actionData?.errors?.repeatPassword}
                  {repeatPassword?.errors?.length
                    ? repeatPassword?.errors[0]
                    : ""}
                </div>
              ) : null}
            </div>
          </div>
          {actionData?.success ? (
            <div className="pt-1 text-green-700" id="email-error">
              {actionData?.success}
            </div>
          ) : null}
          {actionData?.errors?.generic ? (
            <div className="pt-1 text-red-700" id="email-error">
              {actionData?.errors?.generic}
            </div>
          ) : null}
          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Create Account
          </button>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/login",
                }}
              >
                Log in
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
