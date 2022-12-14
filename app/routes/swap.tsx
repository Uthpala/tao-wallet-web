import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useState } from "react";
import Input from "~/components/elements/Input";
import Alert from "~/components/Alert";
import Select from "~/components/elements/Select";
import { requireUserId } from "~/session.server";
import { getTaoWallet } from "~/utils/tao-wallet";

export async function action({ request }: ActionArgs) {
  await requireUserId(request);
  const formData = await request.formData();

  const swap = formData.get("swap");
  const amountInUsd = formData.get("amountInUsd");

  if (amountInUsd == "") {
    return json({
      errors: {
        backend: null,
        amountInUsd: "Please enter a amount",
      },
      swapped: false,
    });
  }

  const tao = await getTaoWallet(request);

  if (swap === "btc-to-usd") {
    try {
      await tao.swap({ from: "btc", to: "usd", amountUsd: amountInUsd });
    } catch (e: any) {
      return json({
        errors: {
          backend: e.message,
          amountInUsd: null,
        },
        swapped: false,
      });
    }
  }
  if (swap === "usd-to-btc") {
    try {
      await tao.swap({ from: "usd", to: "btc", amountUsd: amountInUsd });
    } catch (e: any) {
      return json({
        errors: {
          backend: e.message,
          amountInUsd: null,
        },
        swapped: false,
      });
    }
  }

  return json({
    errors: null,
    swapped: true,
  });
}

export default function SendBitcoin() {
  const actionData = useActionData<typeof action>();
  const [close, setClose] = useState(true);

  return (
    <div>
      {actionData?.swapped && close && (
        <Alert type="success" title={`Swapped`} close={() => setClose(false)} />
      )}
      {actionData?.errors?.backend && close && (
        <Alert
          type="fail"
          title={actionData?.errors.backend}
          close={() => setClose(false)}
        />
      )}
      <h1 className="text-lg font-medium leading-6 text-gray-900">
        Swap Bitcoin To Usd or Swap Usd to Bitcoin
      </h1>

      <div className="mt-8">
        <Form method="post" className="space-y-6">
          <Select
            label="Swap"
            name="swap"
            options={[
              { value: "usd-to-btc", label: "USD to Bitcoin" },
              { value: "btc-to-usd", label: "Bitcoin to USD" },
            ]}
          />
          <Input
            type="number"
            label="Amount in USD"
            name="amountInUsd"
            error={actionData?.errors?.amountInUsd}
            required
          />
          <div>
            <button
              type="submit"
              className="flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Swap
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
