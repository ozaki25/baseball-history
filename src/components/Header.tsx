export default function Header() {
  return (
    <header className="bg-fighters-primary text-white shadow-fighters-lg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-bold">
              観戦履歴
            </h1>
            <span className="text-fighters-gold text-sm sm:text-base font-medium">
              ファイターズ
            </span>
          </div>
          
          <nav aria-label="メインナビゲーション">
            <div className="flex items-center space-x-4">
              <button 
                className="text-white hover:text-fighters-gold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-fighters-gold focus:ring-offset-2 focus:ring-offset-fighters-primary rounded px-2 py-1"
                aria-label="設定"
              >
                設定
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}