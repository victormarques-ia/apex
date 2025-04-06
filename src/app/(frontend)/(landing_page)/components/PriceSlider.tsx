// components/PriceSlider.tsx
"use client";

import React, { useState } from "react";

export function PriceSlider(): JSX.Element {
  const [nAlunos, setNAlunos] = useState<number>(1);

  function getMensalPrice(n: number): number {
    if (n >= 50) {
      return n * 10;
    } else if (n > 20) {
      return n * 12;
    } else {
      return n * 15;
    }
  }

  function getSemestralPrice(n: number): number {
    if (n >= 50) {
      return n * 8;
    } else if (n > 20) {
      return n * 10;
    } else {
      return n * 12;
    }
  }

  function getAnualPrice(n: number): number {
    if (n >= 50) {
      return n * 6;
    } else if (n > 20) {
      return n * 8;
    } else {
      return n * 10;
    }
  }

  function handleSliderChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setNAlunos(Number(event.target.value));
  }

  return (
    <div className="p-4 bg-gray-50 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-center">Planos e Preços</h2>
      <div className="flex flex-col items-center">
        <label htmlFor="slider" className="mb-2">
          Quantidade de Alunos: {nAlunos}
        </label>
        <input
          id="slider"
          type="range"
          min="1"
          max="200"
          value={nAlunos}
          onChange={handleSliderChange}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-white rounded shadow text-center">
          <h3 className="font-medium">Plano Mensal</h3>
          <p className="mt-2">R$ {getMensalPrice(nAlunos)}/mês</p>
        </div>
        <div className="p-4 bg-white rounded shadow text-center">
          <h3 className="font-medium">Plano Semestral</h3>
          <p className="mt-2">R$ {getSemestralPrice(nAlunos)}/mês</p>
        </div>
        <div className="p-4 bg-white rounded shadow text-center">
          <h3 className="font-medium">Plano Anual</h3>
          <p className="mt-2">R$ {getAnualPrice(nAlunos)}/mês</p>
        </div>
      </div>
    </div>
  );
}