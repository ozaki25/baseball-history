import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <section className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-fs-primary mb-4">
              観戦履歴管理
            </h2>
            <p className="text-fs-gray-600 text-lg">
              北海道日本ハムファイターズの観戦記録を管理しましょう
            </p>
          </section>

          <section className="bg-fs-blue-50 rounded-lg p-6 border border-fs-blue-200">
            <h3 className="text-xl font-bold text-fs-primary mb-4">
              🏟️ 今シーズンの観戦履歴
            </h3>
            <div className="text-center text-fs-gray-600">
              <p>データを読み込み中...</p>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-fs-white border border-fs-gray-200 rounded-lg p-6 text-center shadow-sm">
              <h4 className="text-lg font-semibold text-fs-primary mb-2">
                総観戦数
              </h4>
              <p className="text-3xl font-bold text-fs-black">--</p>
            </div>
            
            <div className="bg-fs-white border border-fs-gray-200 rounded-lg p-6 text-center shadow-sm">
              <h4 className="text-lg font-semibold text-result-win mb-2">
                勝利数
              </h4>
              <p className="text-3xl font-bold text-result-win">--</p>
            </div>
            
            <div className="bg-fs-white border border-fs-gray-200 rounded-lg p-6 text-center shadow-sm">
              <h4 className="text-lg font-semibold text-fs-primary mb-2">
                勝率
              </h4>
              <p className="text-3xl font-bold text-fs-primary">--%</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
