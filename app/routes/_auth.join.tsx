import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useActionData, useSearchParams } from "@remix-run/react";
import { z } from "zod";

import { singToken } from "~/models/jwt.server";
import { getUserByEmail, sgMail } from "~/models/user.server";
import { getUserId } from "~/session.server";
import { validateEmail } from "~/utils";

const schema = z.object({
  email: z.string().min(1).email(),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(
      { errors: { email: submission?.error?.email }, success: null },
      { status: 400 },
    );
  }

  const email = submission.value.email;

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid" }, success: null },
      { status: 400 },
    );
  }

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return json(
      {
        errors: {
          email: "A user already exists with this email",
        },
        success: null,
      },
      { status: 400 },
    );
  }

  const join_token = singToken({ email });

  const msg = {
    to: email,
    from: "auto@suminsur.net", // Use the email address or domain you verified above
    subject: "Account confirmation",
    text: `
    Start the register process!
    
    `,
    html: `<p>Click <a href='http://localhost:3000/register?join_token=${join_token}'>here</a>
    To complete the register proces</p>`,
  };

  const joinMailSended = await sgMail.send(msg);

  if (!joinMailSended) {
    return json(
      {
        errors: {
          email:
            "The registration mail couldnt be send in this moment, sorry and  please try later",
        },
        success: null,
      },
      {
        status: 500,
      },
    );
  }
  return json(
    {
      errors: { email: null },
      success: "The register email was sended successfully",
    },
    { status: 200 },
  );
};

export const meta: MetaFunction = () => [{ title: "Sign Up" }];

export default function Join() {
  const [searchParams] = useSearchParams();

  const actionData = useActionData<typeof action>();

  const [form, { email }] = useForm({
    shouldValidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
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
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                type="text"
                name={email.name}
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.email || email.errors?.length ? (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData?.errors?.email}
                  {email?.errors?.length ? email?.errors[0] : ""}
                </div>
              ) : null}
              {actionData?.success ? (
                <div className="pt-1 text-green-700" id="email-error">
                  {actionData?.success}
                </div>
              ) : null}
            </div>
          </div>
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
                  search: searchParams.toString(),
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
