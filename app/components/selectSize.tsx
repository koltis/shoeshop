import { FieldMetadata, FormMetadata } from "@conform-to/react";
import { Combobox } from "@headlessui/react";
import { useEffect, useMemo, useState } from "react";

import { NewProductSchema } from "~/routes/admin.products.new";

import { FilteredSize } from "./filteredSize";

export const SelectSize = <TSschema extends Record<string, unknown>>({
  size,
  sizes,
  form,
  sizeFieldList,
}: {
  size: FieldMetadata<NewProductSchema["size"], NewProductSchema>;
  sizes: {
    id: string;
    size: string;
  }[];
  form: FormMetadata<TSschema>;
  sizeFieldList: FieldMetadata<NewProductSchema["size"][0], NewProductSchema>[];
}) => {
  const [query, setQuery] = useState("");

  const [close, setClose] = useState(false);

  const canAdd = useMemo(() => {
    return sizes.findIndex((size) => {
      return size.size === query;
    });
  }, [query, sizes]);

  useEffect(() => {
    if (query) {
      setClose(false);
    }
  }, [query]);

  const filteredSizes =
    query === ""
      ? sizes
      : sizes.filter((size) => {
          return size.size.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <div>
      <Combobox
        onChange={() => {
          setQuery("");
          setClose(true);
        }}
        multiple
      >
        {({ open }) => (
          <div className="relative  mt-1">
            <Combobox.Input
              className="w-full rounded border text-gray-900 border-gray-500 pl-5 py-1 text-lg text-left"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
            />
            {open && !close ? (
              <Combobox.Options
                static
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
              >
                <>
                  {filteredSizes.length === 0 && query !== "" ? (
                    <div className="cursor-default select-none py-2 pl-5 pr-4 text-lg text-gray-900">
                      <div>...No Size</div>
                    </div>
                  ) : (
                    <>
                      {filteredSizes.map(({ size: name }) => {
                        return (
                          <FilteredSize
                            key={name}
                            name={name}
                            sizeFieldList={sizeFieldList}
                            size={size}
                            form={form}
                          />
                        );
                      })}
                    </>
                  )}
                  {canAdd === -1 ? (
                    <div className="py-2 pl-5 pr-4">
                      <button
                        onClick={(event) => {
                          event.preventDefault();
                          sizes.push({ id: query, size: query });
                          form.insert({
                            name: size.name,
                            defaultValue: {
                              size: query,
                              units: 0,
                            },
                          });
                          setQuery("");
                          setClose(true);
                        }}
                        className=" mt-1 rounded w-full text-right cursor-default select-none py-2 pl-5 pr-4 text-lg hover:bg-teal-200 bg-teal-100 hover:text-teal-900 text-gray-900 "
                      >
                        + Add
                      </button>
                    </div>
                  ) : (
                    void 0
                  )}
                </>
              </Combobox.Options>
            ) : (
              void 0
            )}
          </div>
        )}
      </Combobox>
      <ul>
        {sizeFieldList.map((sizeField, index) => {
          const sizeFields = sizeField.getFieldset();
          return (
            <li
              key={sizeField.key}
              className={`  relative  bg-slate-50     border border-gray  mt-2 rounded min-w-[45%] text-left cursor-default select-none pb-2 pl-5 pr-4 text-l
              text-grey-900 focus:outline-none`}
            >
              <div className="  flex flex-wrap mx-4">
                <div className="  mt-2 bg-cyan-50  rounded px-2">
                  Size {sizeFields.size.initialValue}
                  <input
                    readOnly
                    hidden
                    className=" border-none outline-none"
                    name={sizeFields.size.name}
                    defaultValue={sizeFields.size.initialValue}
                  />
                </div>
                <span className=" mt-2 px-2">stock : </span>
                <input
                  className=" pl-2 py-1 mt-2 ml-2 rounded  text-gray-900 border border-gray-500 bg-white text-lg text-left  focus:outline-gray-500  "
                  type="number"
                  name={sizeFields.units.name}
                />
                <>
                  {sizeFields.units.errors ? (
                    <p className="text-red-500  text-base w-[70%] ">
                      {" "}
                      {sizeFields.units.errors}{" "}
                    </p>
                  ) : (
                    void 0
                  )}
                  {sizeFields.size.errors ? (
                    <p className="text-red-500  text-base w-[70%] ">
                      {" "}
                      {sizeFields.size.errors}{" "}
                    </p>
                  ) : (
                    void 0
                  )}
                </>
              </div>

              <div className="absolute right-0 top-0">
                <button
                  type="button"
                  className=" hover:text-red-500 p-2 text-base"
                  onClick={(e) => {
                    e.preventDefault();
                    form.remove({
                      name: size.name,
                      index,
                    });
                  }}
                >
                  X
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
