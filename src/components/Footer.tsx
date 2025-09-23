export default function Footer() {
  return (
    <footer className="bg-fs-gray-50 border-t border-fs-gray-200 mt-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-fs-gray-600">
          <div className="mb-2 sm:mb-0">
            <p>&copy; 2024 観戦履歴アプリ</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-fs-gold font-medium">
              北海道日本ハムファイターズ
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}