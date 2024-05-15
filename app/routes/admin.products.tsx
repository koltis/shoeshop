import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import { requireAdmin } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);

  return json({});
};

export default function AdminProductsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <main className="flex h-full bg-white ">
        <div className="fixed h-full w-80 border-r bg-gray-50">
          <Link to="./new" className="block p-4 text-xl text-blue-500">
            + New Product
          </Link>

          <hr />
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </>
  );
}
