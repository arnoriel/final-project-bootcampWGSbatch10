import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import axios from 'axios';
import moment from 'moment';

const AttendanceChart = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await axios.get('http://10.10.101.34:5000/api/attendance', {
          params: { period: 'monthly' }, // Mengambil data untuk periode bulanan
        });

        const attendance = response.data.attendance;

        // Mendapatkan tanggal awal dan akhir bulan ini
        const startOfMonth = moment().startOf('month');
        const endOfMonth = moment().endOf('month');

        // Buat array dengan setiap tanggal dalam bulan ini
        const allDates = [];
        let currentDate = startOfMonth;

        while (currentDate <= endOfMonth) {
          allDates.push(currentDate.format('YYYY-MM-DD'));
          currentDate = currentDate.add(1, 'days');
        }

        // Memetakan data attendance berdasarkan tanggal dan menghitung jumlah per tanggal
        const attendanceMap = attendance.reduce((acc, item) => {
          const date = item.login_at.split('T')[0]; // Mendapatkan tanggal (format YYYY-MM-DD)
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date] += 1; // Menambah jumlah attendance pada tanggal tersebut
          return acc;
        }, {});

        // Gabungkan tanggal kosong dengan attendance yang ada
        const data = allDates.map(date => attendanceMap[date] || 0);
        
        setAttendanceData(data);
        setLabels(allDates);

        // Hancurkan chart sebelumnya jika ada
        if (chartInstance) {
          chartInstance.destroy();
        }

        const ctx = document.getElementById('chart-monthly').getContext('2d');

        const newChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: allDates,
            datasets: [
              {
                label: 'Total Attendance per Day',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Total Attendance',
                },
              },
              x: {
                title: {
                  display: true,
                  text: 'Date',
                },
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

    // Bersihkan chart ketika komponen di-unmount
    return () => {
      if (chartInstance) chartInstance.destroy();
    };
  }, []);

  return <canvas id="chart-monthly"></canvas>;
};

export default AttendanceChart;
