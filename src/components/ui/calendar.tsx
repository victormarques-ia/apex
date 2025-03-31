'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Calendar({ selectedDate, onDateChange }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthDays, setMonthDays] = useState([]);

  // Dias da semana em português
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Gerar os dias do mês atual
  useEffect(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Preencher com dias vazios no início se necessário
    const startDay = start.getDay();
    const emptyStartDays = Array(startDay).fill(null);

    setMonthDays([...emptyStartDays, ...days]);
  }, [currentMonth]);

  // Navegação entre meses
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Cabeçalho do calendário */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="sm" onClick={prevMonth}>
          &lt;
        </Button>
        <h3 className="font-medium">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <Button variant="ghost" size="sm" onClick={nextMonth}>
          &gt;
        </Button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Dias do mês */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-8"></div>;
          }

          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <Button
              key={day.toString()}
              variant={isSelected ? 'default' : 'ghost'}
              size="sm"
              className={`h-8 p-0 ${!isCurrentMonth ? 'text-gray-400' : ''}`}
              onClick={() => onDateChange(day)}
              disabled={!isCurrentMonth}
            >
              {format(day, 'd')}
            </Button>
          );
        })}
      </div>
    </div>
  );
}