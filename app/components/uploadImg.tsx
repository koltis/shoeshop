import { FieldMetadata } from "@conform-to/react";
import { useDrag, useDrop } from "react-dnd";

import { NewProductSchema } from "~/routes/admin.products.new";

export const UploadImg = ({
  imagesInfoFieldSet,
  index,
  imgDrop,
}: {
  imgDrop: ({
    from,
    to,
  }: {
    from: {
      index: number;
      url: string | undefined;
    };
    to: {
      index: number;
      url: string | undefined;
    };
  }) => void;
  imagesInfoFieldSet: Required<{
    from: FieldMetadata<number, NewProductSchema>;
    url: FieldMetadata<string, NewProductSchema>;
    delete?: FieldMetadata<boolean, NewProductSchema> | undefined;
  }>;
  index: number;
}) => {
  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    // "type" is required. It is used by the "accept" specification of drop targets.
    type: "IMG",
    item: {
      url: imagesInfoFieldSet.url.initialValue,
    },
    // The collect function utilizes a "monitor" instance (see the Overview for what this is)
    // to pull important pieces of state from the DnD system.
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      // The type (or types) to accept - strings or symbols
      accept: "IMG",

      // Props to collect
      drop(item: { url: string }, monitor) {
        if (item) {
          if (item.url !== imagesInfoFieldSet.url.initialValue) {
            console.log({
              from: { index: 0, url: item.url },
              to: { index, url: imagesInfoFieldSet.url.initialValue },
            });
            imgDrop({
              from: { index: 0, url: item.url },
              to: { index, url: imagesInfoFieldSet.url.initialValue },
            });
          }
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [index],
  );

  return (
    <div
      key={imagesInfoFieldSet.url.initialValue}
      className={`${
        imagesInfoFieldSet.delete.initialValue === "on" ? "hidden" : ""
      } `}
      ref={drop}
    >
      <div
        role="option"
        tabIndex={0}
        aria-selected
        onKeyDown={() => {
          console.log();
        }}
        className={`rounded mb-1 border-blue-500 ${
          isOver
            ? "border-2  pt-2 pl-2 bg-green-200"
            : " hover:border-2 border-cyan-500  "
        }`}
        ref={drag}
      >
        <img
          className=""
          alt={"image " + index}
          src={imagesInfoFieldSet.url.initialValue}
        />
      </div>
      <input
        name={imagesInfoFieldSet.url.name}
        defaultValue={imagesInfoFieldSet.url.initialValue}
        hidden
      />
      <input
        name={imagesInfoFieldSet.from.name}
        defaultValue={imagesInfoFieldSet.from.initialValue}
        hidden
      />
      <input
        name={imagesInfoFieldSet.delete.name}
        defaultValue={imagesInfoFieldSet.delete.initialValue}
        hidden
      />
    </div>
  );
};
