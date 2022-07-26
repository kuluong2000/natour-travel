import React from 'react';

import classes from './card.module.css';

const Card = ({ tour }) => {
  return (
    <div className={classes.card}>
      <div className={classes.card_header}>
        <img src="https://source.unsplash.com/random" alt="random" />
      </div>
      <div className={classes.card_body}>
        <h3>{tour.name}</h3>
        <p>{tour.price}</p>
        <p>{tour.ratingsAverage}</p>
      </div>
    </div>
  );
};

export default Card;
