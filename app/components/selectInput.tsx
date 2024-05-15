import { FieldMetadata } from "@conform-to/react";
import { Combobox } from "@headlessui/react";
import { useEffect, useMemo, useState } from "react";

export const SelectInput = ({
  inputControl,
  options,
  option,
}: {
  inputControl: {
    value: string | undefined;
    change: React.Dispatch<React.SetStateAction<string | undefined>>;
    focus: () => void;
    blur: () => void;
  };
  options: {
    name: string;
    id: string;
  }[];
  option: FieldMetadata<string, Record<string, unknown>, string[]>;
}) => {
  const [selectedoption, setSelectedoption] = useState("");
  const [query, setQuery] = useState("");

  const [close, setClose] = useState(false);

  useEffect(() => {
    if (selectedoption) {
      setClose(true);
      inputControl.change(selectedoption);
    }
  }, [selectedoption, inputControl]);
  useEffect(() => {
    if (query) {
      setClose(false);
    }
  }, [query]);

  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) => {
          return option.name.toLowerCase().includes(query.toLowerCase().trim());
        });
  const optionExists = useMemo(() => {
    return options.findIndex((option) => {
      return query.toLocaleLowerCase() === option.name.toLocaleLowerCase();
    }) === -1
      ? false
      : true;
  }, [query, options]);

  useEffect(() => {
    if (!close && !query && !filteredOptions.length) {
      setClose(true);
    }
  }, [close, query, setQuery, filteredOptions]);

  return (
    <div>
      <Combobox value={selectedoption} onChange={setSelectedoption}>
        {({ open }) => {
          return (
            <div className="relative  mt-1">
              <Combobox.Input
                className="w-full rounded border text-gray-900 border-gray-500 pl-5 py-1 text-lg text-left  "
                onChange={(event) => {
                  setQuery(event.target.value.trim());
                }}
              />
              {open && !close ? (
                <Combobox.Options
                  static
                  className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
                >
                  <>
                    {filteredOptions.length === 0 && query !== "" ? (
                      <div className="cursor-default select-none py-2 pl-5 pr-4 text-lg text-gray-900">
                        <div>...No option</div>
                      </div>
                    ) : (
                      <>
                        {filteredOptions.map(({ name }) => (
                          <Combobox.Option
                            key={name}
                            value={name}
                            className={({ active }) =>
                              ` cursor-default select-none py-2 pl-5 pr-4 text-lg ${
                                active
                                  ? "bg-sky-100 text-sky-900"
                                  : "text-gray-900"
                              }`
                            }
                          >
                            {name}
                          </Combobox.Option>
                        ))}
                      </>
                    )}
                    {query && !optionExists ? (
                      <div className="py-2 pl-5 pr-4">
                        <button
                          onClick={(event) => {
                            event.preventDefault();

                            options.push({ id: query, name: query });
                            setSelectedoption(query);
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
          );
        }}
      </Combobox>
      {selectedoption ? (
        <input
          type="text"
          readOnly
          value={selectedoption}
          name={option.name}
          className={`   border border-gray  mt-2 rounded min-w-[45%] text-left cursor-default select-none py-2 pl-5 pr-4 text-lg  bg-slate-50
            text-grey-900 focus:outline-none`}
        />
      ) : (
        void 0
      )}
      {option.errors ? (
        <p className="text-red-500"> {option.errors} </p>
      ) : (
        void 0
      )}
    </div>
  );
};
