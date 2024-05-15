import { Combobox } from "@headlessui/react";

export const colorVariants: Record<
  string,
  {
    text: string;
    bg: string;
    hover: string;
  }
> = {
  blue: {
    text: "text-blue-900",
    bg: "bg-blue-100",
    hover: "hover:bg-blue-200",
  },
  gray: {
    text: "text-gray-900",
    bg: "bg-gray-100",
    hover: "hover:bg-gray-200",
  },
  red: {
    text: "text-red-900",
    bg: "bg-red-100",
    hover: "hover:bg-red-200",
  },
  orange: {
    text: "text-orange-900",
    bg: "bg-orange-100",
    hover: "hover:bg-orange-200",
  },
  yellow: {
    text: "text-yellow-900",
    bg: "bg-yellow-100",
    hover: "hover:bg-yellow-200",
  },
  green: {
    text: "text-green-900",
    bg: "bg-green-100",
    hover: "hover:bg-green-200",
  },
  cyan: {
    text: "text-cyan-900",
    bg: "bg-cyan-100",
    hover: "hover:bg-cyan-200",
  },
  purple: {
    text: "text-purple-900",
    bg: "bg-purple-100",
    hover: "hover:bg-purple-200",
  },
  pink: {
    text: "text-pink-900",
    bg: "bg-pink-100",
    hover: "hover:bg-pink-200",
  },
  white: {
    text: "text-black",
    bg: "bg-white",
    hover: "hover:bg-white",
  },
  black: {
    text: "text-black",
    bg: "bg-stone-300",
    hover: "hover:bg-stone-400",
  },
};

export const SelectColorOption = ({ name }: { name: string }) => {
  return (
    <Combobox.Option
      key={name}
      value={name}
      className={({ active }) =>
        ` ${
          colorVariants[name] ? colorVariants[name].bg : ""
        } cursor-default select-none py-2 pl-5 pr-4 text-lg ${
          active
            ? `${colorVariants[name] ? colorVariants[name].hover : ""} ${
                colorVariants[name] ? colorVariants[name].text : ""
              } 
              `
            : "text-gray-900"
        }`
      }
    >
      {name}
    </Combobox.Option>
  );
};
