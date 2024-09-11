import React from 'react';

interface Stat {
  type: string;
  player: string;
  time: number;
}

interface StatsTableProps {
  stats: Stat[];
}

const StatsTable: React.FC<StatsTableProps> = ({ stats }) => {
  return (
    <table className="min-w-full table-auto">
      <thead>
        <tr>
          <th>Player</th>
          <th>Stat Type</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {stats.map((stat, index) => (
          <tr key={index}>
            <td>{stat.player}</td>
            <td>{stat.type}</td>
            <td>{stat.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StatsTable;
