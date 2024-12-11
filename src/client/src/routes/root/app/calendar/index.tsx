import React from 'react';
import CalendarPage from '../../../../components/calendar/CalendarPage';
import { getAllMeals } from '../../../../apis/mealsApi';
import { Meal } from '../../../../types/types';


const Calendar = () => {
  return (
    <CalendarPage />
  )
}
export const mealsLoader = async (): Promise<Meal[]> => {
    return getAllMeals()
      .then((fetchedMeals) => {
        // setMyMeals(
        //   fetchedMeals.map((meal: Meal) => ({
        //     start: new Date(meal.startDate), // Ensure to format if needed
        //     end: new Date(meal.endDate), // Ensure to format if needed
        //     title: meal.name,
        //     id: meal.id,
        //   } as MyMeal))
        // );
        console.log('setMeals');
        return fetchedMeals;
        
      })
      .catch((error) => {
        console.error('Error fetching meals:', error);
        throw new Error('Could not fetch meals');
      });
  }
export default Calendar;
