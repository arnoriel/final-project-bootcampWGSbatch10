import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto'; // Import Chart.js
import axios from 'axios';

const AttendanceChart = ({ period }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    // Fetch attendance data based on the selected period
    const fetchAttendanceData = async () => {
      try {
        const response = await axios.get('http://10.10.101.34:5000/api/attendance', {
          params: { period },
        });

        const attendance = response.data.attendance;
        const labels = attendance.map((item) => item.login_at.split('T')[0]); // Extract date
        const data = attendance.map((item) => item.user_id); // Use user_id as data for now

        setAttendanceData(data);
        setLabels(labels);

        // If chartInstance already exists, destroy it before creating a new one
        if (chartInstance) {
          chartInstance.destroy();
        }

        const ctx = document.getElementById(`chart-${period}`).getContext('2d');

        const newChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: `Attendance (${period})`,
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });

        setChartInstance(newChartInstance);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };

    fetchAttendanceData();

    // Cleanup chart when component unmounts
    return () => {
      if (chartInstance) chartInstance.destroy();
    };
  }, [period]);

  return <canvas id={`chart-${period}`}></canvas>;
};

export default AttendanceChart;
