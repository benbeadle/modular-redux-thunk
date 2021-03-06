import { expect } from 'chai';
import { combineModules, reducerToModule } from '../../src/modules';

describe('modules', function () {
  const SET_FAVORITE_CHIPS = 'chips/SET_FAVORITE_CHIPS';
  const SET_CHIPS_FOR_SALE = 'chips/SET_CHIPS_FOR_SALE';

  describe('combineModules', function () {
    it('should combine modules', function () {
      const favoriteChips = {
        reducer: (state = 'unknown', action) => {
          switch (action.type) {
            case SET_FAVORITE_CHIPS:
              return action.newFav;
            default:
              return state;
          }
        },
        actions: {
          setFavoriteChips: (newFav) => ({ type: SET_FAVORITE_CHIPS, newFav })
        },
        selectors: {
          getFavoriteChips: (state) => state
        }
      }

      const chipsForSale = {
        reducer: (state = [], action) => {
          switch (action.type) {
            case SET_CHIPS_FOR_SALE:
              return action.chips
            default:
              return state;
          }
        },
        actions: {
          setChipsForSale: (chips) => ({ type: SET_CHIPS_FOR_SALE, chips })
        },
        selectors: {
          getChipsForSale: (state) => state
        }
      };

      const singleModule = combineModules({
        favoriteChips,
        chipsForSale
      });

      expect(singleModule.reducer).to.be.a('function');
      expect(singleModule.reducer(undefined, { type: '__INIT__' })).to.deep.equal({
        favoriteChips: 'unknown',
        chipsForSale: [],
      }, 'should combine reducers');

      expect(singleModule.actions.setFavoriteChips('bbq')).to.deep.equal({
        type: SET_FAVORITE_CHIPS,
        newFav: 'bbq'
      }, 'should combine actions');
      expect(singleModule.actions.setChipsForSale(['salt & vinegar'])).to.deep.equal({
        type: SET_CHIPS_FOR_SALE,
        chips: ['salt & vinegar']
      }, 'should combine actions');

      const mockState = {
        favoriteChips: 'bbq',
        chipsForSale: ['salt & vinegar']
      };
      expect(singleModule.selectors.getFavoriteChips(mockState)).to.equal('bbq', 'should combine selectors');
      expect(singleModule.selectors.getChipsForSale(mockState)).to.deep.equal(['salt & vinegar'], 'should combine selectors');
    });

    it('should support reducers property', function () {
      const chips = {
        reducers: {
          favorite: (state = 'bbq', action) => state,
          forSale: (state = ['salt & vinegar'], action) => state,
        },
        actions: {},
        selectors: {
          getFavoriteChips: (state) => state.favorite,
          getChipsForSale: (state) => state.forSale
        },
      };
      const favoriteDrink = {
        reducer: (state = 'coffee', action) => state,
        actions: {},
        selectors: {
          getFavoriteDrink: (state) => state,
        },
      }

      const singleModule = combineModules({ chips, favoriteDrink });
      const state = singleModule.reducer(undefined, { type: '__INIT__' });
      expect(singleModule.selectors.getFavoriteChips(state)).to.equal('bbq');
      expect(singleModule.selectors.getChipsForSale(state)).to.deep.equal(['salt & vinegar']);
      expect(singleModule.selectors.getFavoriteDrink(state)).to.equal('coffee');
    });
  });

  describe('reducerToModule', function () {
    const testReducer = (state, action) => 'hello';
    const testModule = reducerToModule(testReducer);
    const combinedModule = combineModules({ testModule });
    expect(combinedModule.reducer(undefined, { type: '__INIT__' })).to.deep.equal({ testModule: 'hello' });
  });
});
