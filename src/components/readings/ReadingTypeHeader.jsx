export default function ReadingTypeHeader({ icon, name }) {
  return (
    <div className="flex items-center gap-2 mb-4 sticky top-0 bg-white z-10 py-2 border-b">
      <span className="text-2xl">{icon}</span>
      <h3 className="font-semibold text-gray-900">{name}</h3>
    </div>
  );
}