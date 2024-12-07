export default function LikeCount({ count = 0 }) {
  return (
    <span className="text-sm font-medium text-gray-500">
      {count}
    </span>
  );
}