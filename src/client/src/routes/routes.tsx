const routes = {
    home: '/',
    calendar: '/calendar',
    newMeal: '/calendar/new',
    products: '/products',
    newProduct: '/products/new',
    dishes: '/dishes',
    newDish: '/dishes/new',
    editDish: (id: number) => `edit/${id}`,
    editMeal: (id: string | number, start: string, end: string, title: string) => `edit/${id}/${start}/${end}/${title}`,
  };
  
  export default routes;