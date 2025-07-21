import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface DataPoint {
    label: string;
    count: number;
}

interface ChartData {
    [key: string]: DataPoint;
}

interface InsightBarChartProps {
    chartData: ChartData;
    color: string;
    fillColor: string;
}

export default function InsightBarChart({ chartData, color, fillColor }: InsightBarChartProps) {
    const data = Object.values(chartData).map((datapoint) => ({
        name: datapoint.label,
        usage: datapoint.count,
    }));

    return (
        <div className="w-full h-[90%]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    {/* <Legend /> */}
                    <Bar
                        dataKey="usage"
                        fill={color}
                        isAnimationActive={false}
                    // activeBar={<Rectangle fill={fillColor} stroke="blue" />}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
