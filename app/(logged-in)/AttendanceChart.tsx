// app/(logged-in)/AttendanceChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AttendanceData {
  name: string;
  value: number;
}

interface AttendanceChartProps {
  data: AttendanceData[];
}

const AttendanceChart = ({ data }: AttendanceChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis unit="%" />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;
