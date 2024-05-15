import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useActionData } from "@remix-run/react";
import { object, z } from "zod";

import { prisma } from "~/db.server";
import { singToken } from "~/models/jwt.server";
import { getUserByEmail, sgMail } from "~/models/user.server";
import { getUserId } from "~/session.server";

const schema = object({
  email: z.string().min(1).email(),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUserId(request);

  if (user) {
    return redirect("/orders");
  }

  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const returnObject: {
    errors: { email: null | string; generic: null | string };
    success: null | string;
  } = {
    errors: { email: null, generic: null },
    success: null,
  };

  const serverError = (error?: string) => {
    returnObject.errors.generic = error
      ? error
      : "There was an unexpected error on the server";
    return json({ ...returnObject }, { status: 500 });
  };

  try {
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema });

    if (submission.status !== "success") {
      returnObject.errors.email = submission?.error?.email
        ? submission?.error?.email[0]
        : null;
      return json(returnObject);
    }
    const email = submission.value.email;

    const user = await getUserByEmail(email);

    if (!user) {
      return serverError("there is no user with that email");
    }

    const recover_token = singToken({ email });

    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: {
        recoverString: recover_token,
      },
    });

    if (!updatedUser) {
      return serverError();
    }

    const msg = {
      to: email,
      from: "auto@suminsur.net", // Use the email address or domain you verified above
      subject: "Password recover",
      text: `
    Recover your password!
    
    `,
      html: `<p>Click <a href='http://localhost:3000/newPassword?recover_token=${recover_token}'>here</a>
    To complete the password recovery </p>`,
    };

    const mail = await sgMail.send(msg);

    if (!mail) {
      return serverError();
    }
    returnObject.success = "the recovery email has been succesfully sended";
    return json({ ...returnObject }, { status: 200 });
  } catch (e) {
    return serverError();
  }
};

export default function RecoverPassword() {
  const actionData = useActionData<typeof action>();

  const [form, { email }] = useForm({
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
              {actionData?.errors?.generic ? (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData?.errors?.generic}
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
            Recover Password
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
