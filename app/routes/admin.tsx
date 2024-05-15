import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, Outlet } from "@remix-run/react";

import { requireAdmin } from "~/session.server";
import { useUser } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);
  return json({});
};

export default function AdminPage() {
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className=" z-10 w-full fixed flex items-center justify-between bg-slate-800 p-4 text-white h-24 ">
        <div className="flex ">
          <h1 className="text-3xl font-bold p-4">
            <Link to="./products">Products</Link>
          </h1>
          <h1 className="text-3xl font-bold p-4">
            <Link to="./orders">Orders</Link>
          </h1>
        </div>

        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>
      <div className=" mt-24 ">
        <Outlet />
      </div>
    </div>
  );
}
