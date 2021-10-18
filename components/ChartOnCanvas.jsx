import { Chart, ChartConfiguration } from "chart.js";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

/**
 *
 * @param {{ config: ChartConfiguration; width:number;height:number;}} props
 * @returns
 */
const ChartOnCanvas = forwardRef(function ChartOnCanvas(props, ref) {
  const { config, width = 400, height = 400 } = props;

  // Variable to store our chart reference
  let chart = useRef(null);

  // Use the `useImperativeHandle` hook to bind our ref to the parent component's ref and expose a method called `toBase64Image`
  useImperativeHandle(
    ref,
    () => ({
      toBase64Image() {
        return chart?.current?.toBase64Image();
      },
    }),
    []
  );

  // Ref to the canvas element
  const canvasRef = useRef(null);

  const createChart = useCallback(() => {
    chart.current = new Chart(canvasRef.current, {
      ...config,
      plugins: [
        ...(config.plugins ?? []),
        {
          id: "custom_canvas_background_color",
          beforeDraw: (chart) => {
            const ctx = chart.canvas.getContext("2d");
            ctx.save();
            ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
          },
        },
      ],
    });

    return () => {
      chart?.current?.destroy();
    };
  }, []);

  useEffect(() => {
    createChart();
  }, [createChart]);

  return (
    <div
      ref={ref}
      style={{
        width,
        height,
      }}
    >
      <canvas ref={canvasRef} width={width} height={width}></canvas>
    </div>
  );
});

export default ChartOnCanvas;
