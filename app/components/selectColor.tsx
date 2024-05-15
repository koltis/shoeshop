import { Combobox } from "@headlessui/react";
import { useEffect, useState } from "react";

import { SelectColorOption, colorVariants } from "./selectColorOptions";

export const SelectColors = ({
  inputColor,
  colors,
}: {
  inputColor: {
    value: string | string[] | undefined;
    change: React.Dispatch<React.SetStateAction<string | string[] | undefined>>;
    focus: () => void;
    blur: () => void;
  };
  colors: {
    name: string;
    id: string;
  }[];
}) => {
  const [selectedcolors, setSelectedcolors] = useState([]);

  useEffect(() => {
    inputColor.change(selectedcolors);
  }, [selectedcolors, inputColor]);

  const [query, setQuery] = useState("");
  const [close, setClose] = useState(false);

  useEffect(() => {
    if (selectedcolors.length) {
      setClose(true);
    }
  }, [selectedcolors]);

  useEffect(() => {
    if (query) {
      setClose(false);
    }
  }, [query]);

  useEffect(() => {
    setQuery("");
  }, [selectedcolors]);

  const filteredcolors =
    query === ""
      ? colors
      : colors.filter((color) => {
          return color.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <div>
      <Combobox
        value={selectedcolors}
        onChange={(v) => setSelectedcolors(v)}
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
                  {filteredcolors.length === 0 && query !== "" ? (
                    <div className="cursor-default select-none py-2 pl-5 pr-4 text-lg text-gray-900">
                      <div>...No color</div>
                    </div>
                  ) : (
                    <>
                      {filteredcolors.map(({ name }) => (
                        <SelectColorOption key={name} name={name} />
                      ))}
                    </>
                  )}
                </>
              </Combobox.Options>
            ) : (
              void 0
            )}
          </div>
        )}
      </Combobox>
      {selectedcolors.length > 0 ? (
        <>
          <div
            className={`  border border-gray   mt-2 rounded w-full text-left flex-wrap flex cursor-default select-none py-2 pl-5 pr-4 text-lg  bg-white
            text-grey-900 focus:outline-none`}
          >
            {selectedcolors.map((color) => {
              return (
                <div
                  className={`  px-2 mt-1 rounded py-1 ${
                    colorVariants[color]
                      ? colorVariants[color].bg
                      : "bg-red-100"
                  } mx-1 `}
                  key={color}
                >
                  {color}
                  <button
                    type="button"
                    className={`p-1 hover:text-xl hover:text-black `}
                    onClick={(event) => {
                      event.preventDefault();
                      setSelectedcolors((prevSelectedColors) => {
                        return prevSelectedColors.filter(
                          (prevSelectedColor) => {
                            return prevSelectedColor !== color;
                          },
                        );
                      });
                    }}
                  >
                    x
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        void 0
      )}
    </div>
  );
};
