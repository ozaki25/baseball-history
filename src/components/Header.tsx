export default function Header() {
  return (
    <header className="bg-fs-primary text-white shadow-fs-lg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-bold">観戦履歴</h1>
            <span className="text-fs-gold text-sm sm:text-base font-medium">ファイターズ</span>
          </div>
        </div>
      </div>
    </header>
  );
}
