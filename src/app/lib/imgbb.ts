export async function uploadImageToImgBB(image: File): Promise<any> {
  const formData = new FormData();
  formData.append("image", image);

  const apiKey = process.env.IMG_BB_API_KEY; // Ensure this is set in .env file
  const url = "https://api.imgbb.com/1/upload";

  const response = await fetch(`${url}?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const data = await response.json();
  return data;
}
