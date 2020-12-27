import React, { useReducer, useEffect, useCallback,useMemo} from "react";

import IngredientForm from "./IngredientForm";
import Search from "./Search";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter((ings) => ings.id !== action.id);

    default:
      throw new Error("Somthing went wrong");
  }
};

const httpReducer = (currentHttpState, action) => {
  switch (action.type) {
    case "SEND_REQ":
      return { loading: true, error: null };
    case "RESPONSE":
      return { ...currentHttpState, loading: false };
    case "ERROR":
      return { loading: true, error: action.errorMessage };
    case "CLEAR":
      return { ...currentHttpState, error: null,loading:false};
    default:
      throw new Error("Something went wrong");
  }
};
const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: null,
  });
  //const [userIngredients, setUserIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState("");

  useEffect(() => {
    console.log("rendering ingredients", userIngredients);
  }, [userIngredients]);
  const filteredIngredientHandler = useCallback((filterIngredients) => {
    dispatch({ type: "SET", ingredients: filterIngredients });
    //setUserIngredients(filterIngredients);
  }, []);

  const clearError =useCallback( () => {
    dispatchHttp({ type: "CLEAR" });
  },[]);

  const addIngredientHandler = useCallback((ingredient) => {
    //setIsLoading(true);
    dispatchHttp({ type: "SEND_REQ" });
    fetch(
      "https://react-hooks-update-1f879-default-rtdb.firebaseio.com/ingredients.jon",
      {
        method: "POST",
        body: JSON.stringify(ingredient),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        dispatchHttp({ type: "RESPONSE" });
        return response.json();
      })
      .then((responseData) => {
        // setUserIngredients((prevIngredient) => [
        //   ...prevIngredient,
        //   { id: responseData.name, ...ingredient },
        // ]);
        dispatch({
          type: "ADD",
          ingredient: { id: responseData.name, ...ingredient },
        });
      })
      .catch((error) => {
        // setError("Something went wrong!");
        dispatchHttp({ type: "ERROR", errorMessage: "Something went wrong!" });
      });
  },[]);

  const removeIngredientHandler = useCallback((ingredientId) => {
    //setIsLoading(true);
    dispatchHttp({ type: "SEND_REQ" });
    fetch(
      `https://react-hooks-update-1f879-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`,
      {
        method: "DELETE",
      }
    )
      .then((response) => {
        // setIsLoading(false);
        dispatchHttp({ type: "RESPONSE" });
        // setUserIngredients((prevIngredient) =>
        // prevIngredient.filter((ingredient) => ingredient.id !== ingredientId)
        //  );
        dispatch({ type: "DELETE", id: ingredientId });
      })
      .catch((error) => {
        // setError("Something went wrong!");
        // setIsLoading(false);
        dispatchHttp({ type: "ERROR", errorMessage: "Something went wrong!" });
      });
  },[]);
  const ingredientList=useMemo(()=>{
    return(
      <IngredientList
      ingredients={userIngredients}
      onRemoveItem={removeIngredientHandler}
    />
    )
  },[userIngredients,removeIngredientHandler])
  return (
    <div className="App">
      {httpState.error && (
        <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />
      <section>
        <Search onLodedIngredients={filteredIngredientHandler} />
        {/* Need to add list here! */}
        {ingredientList}
      
      </section>
    </div>
  );
};

export default Ingredients;
