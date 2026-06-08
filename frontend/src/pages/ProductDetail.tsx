import { useParams } from "@solidjs/router";
export default function ProductDetail() {
  const params = useParams();
  return (
    <div class="p-8">
      <h1 class="text-2xl font-bold">Product Detail</h1>
      <p>Product ID: {params.id}</p>
    </div>
  );
}
