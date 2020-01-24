import React, {useReducer, useCallback, useMemo, useEffect} from 'react';
//useCallback is the hook not to re render function

import IngredientList from './IngredientList';
import IngredientForm from './IngredientForm';
import Search from './Search';
import ErrorModal from '../UI/ErrorModal';
import useHttp from '../../hooks/http';

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

  const {
    isLoading, 
    error, 
    data, 
    sendRequest, 
    reqExtra, 
    reqIdentifier,
    clear} = useHttp();

  useEffect(()=> {
    if (!isLoading && !error && reqIdentifier === 'REMOVE_INGREDIENT'){
      dispatch({type: 'DELETE', id: reqExtra})
    } else if (!isLoading && !error && reqIdentifier === 'ADD_INGREDIENT') {
      dispatch({
        type: 'ADD',
        ingredient: {id: data.name, ...reqExtra}
      })
    }
  },[data,reqExtra, reqIdentifier,isLoading, error]);
    
  
  //This filteringredients pass to search.js make sure to load data form server
  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    dispatch({type: 'SET', ingredients: filteredIngredients});
  },[])


  const addIngredientHandler = useCallback((ingredient) => {
    sendRequest('https://react-hock-update.firebaseio.com/ingredients.json',
    'POST',
    JSON.stringify(ingredient),
    ingredient,
    'ADD_INGREDIENT');
  },[sendRequest])

  const removeIngredientHandler = useCallback((ingredientId) => {;
    sendRequest(`https://react-hock-update.firebaseio.com/ingredients/${ingredientId}.json`,
    'DELETE',
    null,
    ingredientId,
    'REMOVE_INGREDIENT');
  },[sendRequest])


  const ingredientList = useMemo(()=>{
    return (
      <IngredientList 
          ingredients={ingredients} 
          onRemoveItem={removeIngredientHandler}/>
    )
  },[ingredients, removeIngredientHandler])

  return (
    <div className="App">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      <IngredientForm 
        onAddIngredient={addIngredientHandler} 
        loading= {isLoading}/>
      <section>
        <Search onLoadIngredients={filteredIngredientsHandler}/>
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;

