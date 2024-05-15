import { useForm, useInputControl } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { z } from "zod";

import { SelectColors } from "~/components/selectColor";
import SelectGender from "~/components/selectGender";
import { SelectInput } from "~/components/selectInput";
import { SelectSize } from "~/components/selectSize";
import { UploadImgs } from "~/components/uploadImgs";
import { prisma } from "~/db.server";
import { getBrands } from "~/models/brand.server";
import { getCategories } from "~/models/categories.server";
import { getColors } from "~/models/colors.server";
import { getSizes } from "~/models/sizes.server";
import uploadImgCloudflare from "~/models/uploadImg.server";
import { requireAdmin } from "~/session.server";

const genders = [{ name: "Male" }, { name: "Female" }, { name: "Kids" }];

const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 1024 * 1024 * 5;

const schema = z.object({
  manufacturerID: z.string().min(1),
  name: z.string().min(4),
  price: z.number().min(1),
  gender: z.enum(["Male", "Female", "Kids"]),
  brand: z.string(),
  color: z.string().array().nonempty({ message: "Select atleast one color" }),
  seoNames: z.string().min(1).array(),
  size: z
    .object({
      units: z.number().min(0),
      size: z.string(),
    })
    .array()
    .nonempty({ message: "Select atleast one size" }),
  category: z.string().min(1),
  subCategory: z.string().min(1),
  discount: z.number().min(0),
  images: z
    .array(
      z
        .instanceof(File)
        .refine((file) => {
          return file?.size <= MAX_FILE_SIZE;
        }, `Max image size is 5MB.`)
        .refine(
          (file) => ACCEPTED_IMAGE_MIME_TYPES.includes(file?.type),
          "Only .jpg, .jpeg, .png and .webp formats are supported.",
        ),
    )
    .min(3)
    .max(6)
    .refine(
      (files) => files.every((file) => file?.size <= MAX_FILE_SIZE),
      "Max image size is 5MB.",
    )
    .refine(
      (files) =>
        files.every((file) => ACCEPTED_IMAGE_MIME_TYPES.includes(file?.type)),
      "Only .jpg, .jpeg, .png and .webp formats are supported.",
    ),
  imagesInfo: z
    .object({
      from: z.number(),
      delete: z.boolean().optional(),
      url: z.string(),
    })
    .array()
    .min(3),
});

export type NewProductSchema = z.infer<typeof schema>;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);

  const [brands, colors, sizes, categories] = await prisma.$transaction([
    getBrands(),
    getColors(),
    getSizes(),
    getCategories(),
  ]);

  return json({ brands, colors, sizes, categories });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    await requireAdmin(request);
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema });

    if (submission.status !== "success") {
      return json(submission.reply());
    }

    const newProduct: NewProductSchema = submission.value;

    let index = 0;
    for (const imageInfo of newProduct.imagesInfo) {
      const response = await uploadImgCloudflare(
        submission.value.images[imageInfo.from],
        newProduct.name,
        index,
      );
      index += 1;

      if (response.result.id) {
        imageInfo.url = response.result.variants[0] as string;
      }
    }

    return json({});
  } catch (error) {
    throw new Error(String(error));
  }
};

export default function NewProduct() {
  const { brands, colors, sizes, categories } = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();

  const [
    form,
    {
      gender,
      brand,
      color,
      size,
      name,
      price,
      seoNames,
      manufacturerID,
      discount,
      category,
      subCategory,
      images,
      imagesInfo,
    },
  ] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    defaultValue: {
      gender: "Male",
    },
    shouldValidate: "onInput",
  });

  const inputGender = useInputControl(gender);
  const inputBrand = useInputControl(brand);
  const inputCategory = useInputControl(category);
  const inputSubcategory = useInputControl(subCategory);
  const inputColor = useInputControl(color);
  const sizeFieldList = size.getFieldList();
  const seoNamesFieldList = seoNames.getFieldList();
  const imagesInfoFieldList = imagesInfo.getFieldList();

  const [seoName, setSeoName] = useState("");
  const [subCategories, setSubCatetegories] = useState<
    { name: string; id: string; [key: string]: unknown }[]
  >([]);

  useEffect(() => {
    if (category.value) {
      setSubCatetegories(() => {
        const selectedCategory = categories.find((categoryInfo) => {
          return categoryInfo.name === category.value;
        });

        if (selectedCategory?.subCategories) {
          return selectedCategory.subCategories;
        } else {
          return [];
        }
      });
    }
  }, [category.value, categories]);

  const addSeoName = useMemo(() => {
    return seoName &&
      seoNamesFieldList.findIndex((seoNameField) => {
        return seoNameField.value === seoName;
      }) === -1
      ? true
      : false;
  }, [seoName, seoNamesFieldList]);

  const errorClassName = "pt-1  text-red-500";
  const labelClassName = " block  text-xl  font-medium text-gray-700 ";
  const inputClass =
    " w-full rounded border border-gray-500 px-2 py-1 text-lg mt-1";

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex min-h-full flex-col justify-center">
        <div className="mx-auto w-full max-w-md px-8 ">
          <Form
            method="post"
            className="space-y-6"
            id={form.id}
            encType="multipart/form-data"
            onSubmit={form.onSubmit}
          >
            <div className="font-medium text-lg">
              <label className={labelClassName} htmlFor={name.id}>
                Name
                <input type="text" className={inputClass} name={name.name} />
                {name.errors ? (
                  <div className={errorClassName} id="name-error">
                    {name?.errors?.length ? name?.errors[0] : ""}
                  </div>
                ) : null}
              </label>
            </div>
            <div className="font-medium text-lg">
              <label className={labelClassName}>
                SeoNames
                <input
                  type="text"
                  onChange={(e) => {
                    setSeoName(e.target.value);
                  }}
                  value={seoName}
                  className={inputClass}
                />
                {addSeoName ? (
                  <button
                    type="button"
                    className="mt-1  cursor-pointer rounded w-full text-right  select-none py-2 pl-5 pr-4 text-lg hover:bg-green-200 bg-green-100 hover:text-teal-900 text-gray-900 "
                    onClick={(e) => {
                      e.preventDefault();
                      form.insert({
                        name: seoNames.name,
                        defaultValue: seoName,
                      });
                      setSeoName("");
                    }}
                  >
                    {" "}
                    Add
                  </button>
                ) : (
                  void 0
                )}
                {seoNamesFieldList.map((seoName, index) => {
                  return (
                    <div
                      key={seoName.key}
                      className={` relative border border-gray  mt-2 rounded min-w-[45%] text-left cursor-default select-none py-2 pl-5 pr-4 text-lg  bg-slate-50
                    text-grey-900 focus:outline-none`}
                    >
                      <input
                        hidden
                        name={seoName.name}
                        defaultValue={seoName.value}
                      />
                      {seoName.value}
                      <button
                        className="absolute top-0 right-0 font-semibold text-gray-900 hover:text-red-500 py-1 px-3 cursor-pointer "
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          form.remove({
                            name: seoNames.name,
                            index,
                          });
                        }}
                      >
                        x
                      </button>
                    </div>
                  );
                })}
                {name.errors ? (
                  <div className={errorClassName} id="name-error">
                    {seoNames?.errors?.length ? seoNames?.errors[0] : ""}
                  </div>
                ) : null}
              </label>
            </div>

            <div>
              <label className={labelClassName} htmlFor={manufacturerID.id}>
                Manufacturer Id
                <input
                  type="text"
                  className={inputClass}
                  name={manufacturerID.name}
                />
                {manufacturerID.errors ? (
                  <div className={errorClassName} id="name-error">
                    {manufacturerID?.errors?.length
                      ? manufacturerID?.errors[0]
                      : ""}
                  </div>
                ) : null}
              </label>
            </div>
            <div>
              <label className={labelClassName} htmlFor={price.id}>
                Price
                <div className={` flex items-center px-0 py-0 ${inputClass}`}>
                  <input
                    type="number"
                    lang="es"
                    step="0.01"
                    className="w-full text-left overflow-scroll px-2 py-1 outline-none bg-white min-w-4"
                    name={price.name}
                  />
                  <p> (€)</p>
                </div>
                {price.errors ? (
                  <div className={errorClassName} id="name-error">
                    {price?.errors?.length ? price?.errors[0] : ""}
                  </div>
                ) : null}
              </label>
            </div>
            <div>
              <label className={labelClassName} htmlFor={discount.id}>
                Discount
                <div className={` flex items-center px-0 py-0 ${inputClass}`}>
                  <input
                    type="number"
                    lang="es"
                    step="0.01"
                    className="w-full text-left overflow-scroll px-2 py-1 outline-none bg-white min-w-4 "
                    name={discount.name}
                    defaultValue={0}
                  />
                  <p> (%)</p>
                </div>
                {discount.errors ? (
                  <div className={errorClassName} id="name-error">
                    {discount?.errors?.length ? discount?.errors[0] : ""}
                  </div>
                ) : null}
              </label>
            </div>
            <div>
              <label className={labelClassName} htmlFor={gender.id}>
                Gender
                <SelectGender inputGender={inputGender} genders={genders} />
                {gender.errors ? (
                  <p className="text-red-500"> {gender.errors} </p>
                ) : (
                  void 0
                )}
              </label>
            </div>
            <div>
              <label className={labelClassName} htmlFor={category.id}>
                Category
                <SelectInput
                  option={category}
                  inputControl={inputCategory}
                  options={categories}
                />
              </label>
            </div>
            <div>
              <label className={labelClassName} htmlFor={subCategory.id}>
                Subcategory
                <SelectInput
                  option={subCategory}
                  inputControl={inputSubcategory}
                  options={subCategories}
                />
              </label>
            </div>
            <div>
              <label className={labelClassName} htmlFor={brand.id}>
                Brand
                <SelectInput
                  option={brand}
                  inputControl={inputBrand}
                  options={brands}
                />
              </label>
            </div>
            <div>
              <label className={labelClassName} htmlFor={color.id}>
                Colors
                <SelectColors inputColor={inputColor} colors={colors} />
                <>
                  {color.errors ? (
                    <p className="text-red-500"> {color.errors} </p>
                  ) : (
                    void 0
                  )}
                </>
              </label>
            </div>
            <div>
              <label htmlFor={size?.id} className={labelClassName}>
                Size
                <SelectSize
                  sizeFieldList={sizeFieldList}
                  form={form}
                  size={size}
                  sizes={sizes}
                />
                {size.errors ? (
                  <p className="text-red-500"> {size.errors} </p>
                ) : (
                  void 0
                )}
              </label>
            </div>
            <UploadImgs
              form={form}
              images={images}
              labelClassName={labelClassName}
              imagesInfoFieldList={imagesInfoFieldList}
              imagesInfo={imagesInfo}
            />
            <button
              type="submit"
              className=" text-xl  font-medium text-gray-700 border-gray-300  rounded-sm border-2  px-4 py-2 bg-slate-50 hover:bg-slate-100 hover:border-gray-400 "
            >
              Submit
            </button>
          </Form>
        </div>
      </div>
    </DndProvider>
  );
}
