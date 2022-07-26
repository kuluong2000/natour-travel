import React, { useState } from 'react';
import { useEffect } from 'react';
import Card from '../../components/Card';
import Skeleton from '../../components/Skeleton';

import classes from './tours.module.css';

const Tours = () => {
  const [loading, setLoading] = useState(false);
  const [tours, setTours] = useState([]);

  useEffect(() => {
    setLoading(true);
    const fetchDelay = setTimeout(
      () =>
        fetch('http://localhost:5000/api/v1/tours')
          .then((response) => response.json())
          .then((data) => {
            const {
              data: { tours },
            } = data;
            setTours(tours);
          })
          .catch((error) => console.log({ error }))
          .finally(() => setLoading(false)),
      1000
    );
    return () => {
      clearTimeout(fetchDelay);
    };
  }, []);

  return (
    <div className={classes.root}>
      <div className={classes.tours}>
        {loading
          ? Array(12)
              .fill(0)
              .map((_, index) => <Skeleton key={index} />)
          : tours.map((tour) => <Card key={tour.id} tour={tour} />)}
      </div>
    </div>
  );
};

export default Tours;
