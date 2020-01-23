import React, {useReducer,useState, useEffect, useCallback} from 'react';

import IngredientList from './IngredientList';
import IngredientForm from './IngredientForm';
import Search from './Search';
import ErrorModal from '../UI/ErrorModal';

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case 'SET': 
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error('Should not get there');              
  }
}

const Ingredients = () => {

  const [ingredients, dispatch] = useReducer(ingredientReducer,[]);

  //const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  
  //This filteringredients pass to search.js make sure to load data form server
  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    //setIngredients(filteredIngredients);
    dispatch({type: 'SET', ingredients: filteredIngredients});
  },[])

  const addIngredientHandler = (ingredient) => {
    setIsLoading(true);
    fetch('https://react-hock-update.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: {'Content-Type': 'application/json'}
    }).then (response => {
      setIsLoading(false);
      return response.json();
    }).then (responseData => {
      // setIngredients(prevIngredients => [
      //   ...prevIngredients,
      //   {id:responseData.name,...ingredient}]);
      dispatch({type: 'ADD', ingredient: {id:responseData.name,...ingredient}})
    }).catch(error => {
      setError(error.message);
    });
    
  }

  const removeIngredientHandler = (ingredientId) => {;
    setIsLoading(true);
    fetch(`https://react-hock-update.firebaseio.com/ingredients/${ingredientId}.json`, {
      method: 'DELETE'      
    }).then(response => {
      setIsLoading(false);
      // setIngredients(prevIngredients => 
      //   prevIngredients.filter((ingredient)=> ingredient.id!== ingredientId));
      dispatch({type: 'DELETE', id : ingredientId})      
    }).catch(error => {
      setError(error.message);
    })
  }

  const clearError =()=>{
    setError(null);
    setIsLoading(false);
  }

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm 
        onAddIngredient={addIngredientHandler} 
        loading= {isLoading}/>
      <section>
        <Search onLoadIngredients={filteredIngredientsHandler}/>
        <IngredientList ingredients={ingredients} onRemoveItem={removeIngredientHandler}/>
      </section>
    </div>
  );
}

export default Ingredients;

