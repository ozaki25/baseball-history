interface YearSelectorProps {
  availableYears: string[];
  selectedYear: string;
  onYearChange: (year: string) => void;
  className?: string;
}

export default function YearSelector({ 
  availableYears, 
  selectedYear, 
  onYearChange, 
  className = '' 
}: YearSelectorProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <label 
        htmlFor="year-select"
        className="text-sm font-medium text-fs-gray-700"
      >
        年度選択:
      </label>
      <select
        id="year-select"
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
        className="border border-fs-gray-300 rounded-md px-3 py-2 text-sm bg-fs-white text-fs-gray-900 focus:outline-none focus:ring-2 focus:ring-fs-primary focus:border-fs-primary transition-colors duration-200"
        aria-label="観戦履歴の年度を選択"
      >
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}年
          </option>
        ))}
      </select>
    </div>
  );
}