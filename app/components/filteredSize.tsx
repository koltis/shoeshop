import { FieldMetadata, FormMetadata } from "@conform-to/react";
import { Combobox } from "@headlessui/react";
import { useMemo } from "react";

import { NewProductSchema } from "~/routes/admin.products.new";

export const FilteredSize = <TSschema extends Record<string, unknown>>({
  name,
  form,
  size,
  sizeFieldList,
}: {
  size: FieldMetadata<NewProductSchema["size"], NewProductSchema>;
  name: string;
  form: FormMetadata<TSschema>;
  sizeFieldList: FieldMetadata<NewProductSchema["size"][0], NewProductSchema>[];
}) => {
  const sizeIndex = useMemo(() => {
    return sizeFieldList.findIndex((sizeField) => {
      const { size } = sizeField.getFieldset();
      return size.initialValue === name;
    });
  }, [sizeFieldList, name]);

  return (
    <>
      {sizeIndex === -1 ? (
        <Combobox.Option
          key={name}
          value={name}
          className={({ active }) =>
            ` cursor-default select-none  text-lg py-2 pl-5 pr-4 ${
              active ? "bg-sky-100 text-sky-900" : "text-gray-900"
            }`
          }
          onClick={() => {
            form.insert({
              name: size.name,
              defaultValue: {
                size: name,
                units: 0,
              },
            });
          }}
        >
          {" "}
          {name}
        </Combobox.Option>
      ) : (
        <Combobox.Option
          key={name}
          value={name}
          className={({ active }) =>
            ` cursor-default select-none  text-lg py-2 pl-5 pr-4 ${
              active ? "bg-sky-100 text-sky-900" : "text-gray-900"
            }`
          }
          onClick={() => {
            form.remove({
              name: size.name,
              index: sizeIndex,
            });
          }}
        >
          {" "}
          {name}
        </Combobox.Option>
      )}
    </>
  );
};
