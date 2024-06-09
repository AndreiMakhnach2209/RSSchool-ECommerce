import API from "api/API";
import toastOptions from "helpers/toastOptions";
import {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { toast } from "react-toastify";
import {
  CartContext,
  CartInitialState,
  cartReducer,
  setActiveCart,
  loading,
} from "reducers/cartReducer";
import { LineItem } from "types/API/Cart";
import { ProductData } from "types/API/Product";

interface ProviderProps {
  children: ReactNode;
}

export function CartProvider(props: ProviderProps): ReactElement {
  const { children } = props;
  const [state, dispatch] = useReducer(cartReducer, CartInitialState);

  const fetchActiveCart = useCallback(async (): Promise<void> => {
    try {
      dispatch(loading(true));
      const cart = await API.getInstance()?.getCart();
      if (cart) dispatch(setActiveCart(cart));
    } catch (err) {
      if (err instanceof Error) toast.error(err.message, toastOptions);
    } finally {
      dispatch(loading(false));
    }
  }, []);

  useEffect(() => {
    fetchActiveCart();
  }, [fetchActiveCart]);

  const addProductToActiveCart = useCallback(
    async (product: ProductData | LineItem, count: number): Promise<void> => {
      try {
        const { activeCart } = state;
        dispatch(loading(true));
        if (activeCart) {
          const cart = await API.getInstance()?.addProductToCart(
            product,
            activeCart,
            count
          );
          if (cart) dispatch(setActiveCart(cart));
        }
      } catch (err) {
        if (err instanceof Error) toast.error(err.message, toastOptions);
      } finally {
        dispatch(loading(false));
      }
    },
    [state]
  );

  const removeProductFromActiveCart = useCallback(
    async (product: LineItem, quantity: number): Promise<void> => {
      try {
        const { activeCart } = state;
        dispatch(loading(true));
        if (activeCart) {
          const cart = await API.getInstance()?.removeProductFromCart(
            product,
            activeCart,
            quantity
          );
          if (cart) dispatch(setActiveCart(cart));
        }
      } catch (err) {
        if (err instanceof Error) toast.error(err.message, toastOptions);
      } finally {
        dispatch(loading(false));
      }
    },
    [state]
  );

  const contextValue = useMemo(
    () => ({
      ...state,
      fetchActiveCart,
      addProductToActiveCart,
      removeProductFromActiveCart,
    }),
    [
      state,
      fetchActiveCart,
      addProductToActiveCart,
      removeProductFromActiveCart,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}
