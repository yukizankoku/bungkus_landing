import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const stats = [
  { value: 500, suffix: '+', labelId: 'Klien Terlayani', labelEn: 'Clients Served' },
  { value: 10, suffix: 'M+', labelId: 'Produk Diproduksi', labelEn: 'Products Produced' },
  { value: 15, suffix: '+', labelId: 'Tahun Pengalaman', labelEn: 'Years Experience' },
  { value: 50, suffix: '+', labelId: 'Karyawan', labelEn: 'Employees' },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 gradient-primary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl sm:text-5xl font-display font-bold text-white mb-2">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-white/80 font-medium">
                {t(stat.labelId, stat.labelEn)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
