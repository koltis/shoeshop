import { FieldMetadata, FormMetadata } from "@conform-to/react";
import { useEffect, useState } from "react";

import { NewProductSchema } from "~/routes/admin.products.new";

import { UploadImg } from "./uploadImg";

export const UploadImgs = <TsSchmea extends Record<string, unknown>>({
  images,
  labelClassName,
  imagesInfoFieldList,
  form,
  imagesInfo,
}: {
  images: FieldMetadata<NewProductSchema["images"], NewProductSchema>;
  labelClassName: string;
  form: FormMetadata<TsSchmea>;
  imagesInfoFieldList: FieldMetadata<
    NewProductSchema["imagesInfo"][0],
    NewProductSchema
  >[];
  imagesInfo: FieldMetadata<NewProductSchema["imagesInfo"], NewProductSchema>;
}) => {
  const [changePosition, setChangePosition] = useState<{
    from: { index: undefined | number; url: string | undefined };
    to: { index: undefined | number; url: string | undefined };
  }>({
    from: { index: undefined, url: "" },
    to: { index: undefined, url: "" },
  });

  useEffect(() => {
    if (
      changePosition.from.index !== undefined &&
      changePosition.to.index !== undefined
    ) {
      if (
        imagesInfoFieldList[changePosition.to.index].getFieldset().url
          .initialValue === changePosition.to.url
      ) {
        const fromIndex = imagesInfoFieldList.findIndex((imageInfo) => {
          return (
            imageInfo.getFieldset().url.initialValue === changePosition.from.url
          );
        });

        form.reorder({
          name: imagesInfo.name,
          from: fromIndex,
          to: changePosition.to.index,
        });
        form.reorder({
          name: imagesInfo.name,
          from:
            changePosition.to.index > fromIndex
              ? changePosition.to.index - 1
              : changePosition.to.index + 1,
          to: fromIndex,
        });
      }
    }
  }, [
    changePosition.to,
    changePosition.from,
    imagesInfo.name,
    imagesInfoFieldList,
    form,
  ]);

  const imgDrop = ({
    from,
    to,
  }: {
    from: { index: number; url: string | undefined };
    to: { index: number; url: string | undefined };
  }) => {
    setChangePosition(() => {
      return {
        from,
        to,
      };
    });
  };

  return (
    <div>
      <label htmlFor={images?.id} className={labelClassName}>
        Mutliple Images
        <input
          type="file"
          className="mt-2"
          name={images.name}
          onChange={(e) => {
            imagesInfoFieldList.forEach((imageInfo) => {
              const imageInfoField = imageInfo.getFieldset();
              if (imageInfoField.url.initialValue) {
                URL.revokeObjectURL(imageInfoField.url.initialValue);
              }
              form.remove({
                name: imagesInfo.name,
                index: 0,
              });
            });

            if (e.target.files) {
              Object.entries(e.target.files).forEach((key, index) => {
                form.insert({
                  name: imagesInfo.name,
                  defaultValue: {
                    url: URL.createObjectURL(key[1]),
                    from: index,
                    delete: "",
                  },
                });
              });
            }
          }}
          multiple
        />
        <div className="text-red-500">
          {Object.entries(images.allErrors).flatMap(([, messages]) => messages)}
        </div>
        <div>
          {imagesInfoFieldList?.length ? (
            <>
              <div className="grid grid-cols-4 gap-1  mt-2">
                <div>
                  {imagesInfoFieldList?.map((imageInfo, index) => {
                    const imagesInfoFieldSet = imageInfo.getFieldset();

                    return index !== 0 ? (
                      <UploadImg
                        key={imagesInfoFieldSet.url.initialValue}
                        index={index}
                        imagesInfoFieldSet={imagesInfoFieldSet}
                        imgDrop={imgDrop}
                      />
                    ) : (
                      void 0
                    );
                  })}
                </div>
                <div className=" col-span-3 ">
                  {imagesInfoFieldList[0] ? (
                    <UploadImg
                      key={
                        imagesInfoFieldList[0].getFieldset().url.initialValue
                      }
                      index={0}
                      imagesInfoFieldSet={imagesInfoFieldList[0].getFieldset()}
                      imgDrop={imgDrop}
                    />
                  ) : (
                    void 0
                  )}
                </div>
              </div>
            </>
          ) : (
            void 0
          )}
        </div>
      </label>
    </div>
  );
};
