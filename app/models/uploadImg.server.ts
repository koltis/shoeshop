const uploadImgCloudflare = async (
  image: Blob,
  name: string,
  index: number,
) => {
  const formData = new FormData();
  formData.append("file", image, `${name + index}`);
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_UPLOAD_TOKEN}`,
        },
        body: formData,
      },
    );

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    throw new Error(String(error));
  }
};

export default uploadImgCloudflare;
