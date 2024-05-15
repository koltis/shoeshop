import { Listbox } from "@headlessui/react";

export default function SelectGender({
  inputGender,
  genders,
}: {
  inputGender: {
    value: string | undefined;
    change: React.Dispatch<React.SetStateAction<string | undefined>>;
    focus: () => void;
    blur: () => void;
  };
  genders: { name: string }[];
}) {
  return (
    <Listbox value={inputGender.value} onChange={inputGender.change}>
      <div className="relative mt-1">
        <Listbox.Button className="w-full rounded border text-gray-900 border-gray-500 pl-5 py-1 text-lg text-left">
          {inputGender.value}
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
          {genders.map(({ name: gender }) => (
            <Listbox.Option
              key={gender}
              value={gender}
              className={({ active }) =>
                `relative cursor-default select-none py-2 pl-5 pr-4 text-lg ${
                  active ? "bg-sky-100 text-sky-900" : "text-gray-900"
                }`
              }
            >
              {gender}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}
