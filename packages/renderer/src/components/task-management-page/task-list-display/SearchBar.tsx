import cancelIcon from '@assets/icons/close-button.svg';
import searchIcon from '@assets/icons/search.svg';
import { waitUntil } from '@remindr/shared';
import { updateSearchQuery } from '@renderer/features/task-list/taskListSlice';
import { useAppDispatch, useAppStore } from '@renderer/hooks';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { isValidSearchString } from '@renderer/scripts/utils/searchutils';
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { memo, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

export const SearchBar = memo(function SearchBar() {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  const [showSearchBar, setShowSearchBar] = useState(false);

  const searchBarRef = useRef<HTMLInputElement>(null);
  const opening = useRef<boolean>(false);

  const animationsEnabled = useAnimationsEnabled();
  const width = useMotionValue(animationsEnabled ? 0 : 190);

  useMotionValueEvent(width, 'animationStart', () => {
    if (parseInt((width.get() as unknown as string).slice(0, -2), 10) < 10) {
      searchBarRef.current?.classList.remove('hide-border');
      opening.current = true;
    }

    if (parseInt((width.get() as unknown as string).slice(0, -2), 10) > 180) {
      searchBarRef.current?.classList.add('hide-border');
      opening.current = false;
    }
  });
  useMotionValueEvent(width, 'animationComplete', () => {
    if ((width.get() as unknown as string) === '0px' || (width.get() as unknown as string) === '190px') {
      opening.current = false;
    }
  });

  useMotionValueEvent(width, 'animationCancel', () => {
    searchBarRef.current?.classList.add('hide-border');
    opening.current = !opening.current;
  });

  const searchBarAnimationProps = animationsEnabled
    ? {
        layout: true,
        initial: { width: '0px', margin: 0, padding: 0, opacity: 0 },
        exit: { width: '0px', margin: 0, padding: 0, opacity: 0 },
        animate: openSearchBarStyle,
      }
    : {
        style: openSearchBarStyle,
      };

  const cancelButtonAnimationProps = animationsEnabled
    ? {
        initial: { opacity: 0 },
        exit: { opacity: 0 },
        animate: { opacity: 1 },
      }
    : { style: { opacity: 1 } };

  useHotkeys('mod+f', () => {
    setShowSearchBar(true);
  });

  const toggleSearchBar = () => {
    if (showSearchBar) {
      closeSearchBar();
      return;
    }

    setShowSearchBar(true);
  };

  const closeSearchBar = () => {
    setShowSearchBar(false);
    dispatch(updateSearchQuery(''));
  };

  // Initialize search bar with search query
  useEffect(() => {
    const populateSearchBar = async (query: string) => {
      await waitUntil(() => searchBarRef.current !== null);
      searchBarRef.current!.value = query;
    };

    const query = store.getState().taskList.searchQuery;
    const validSearchQuery = isValidSearchString(query);

    if (!validSearchQuery) return;

    setShowSearchBar(true);
    populateSearchBar(query);
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <button
        id="searchButton"
        className="accessible-button"
        type="button"
        onClick={toggleSearchBar}
        aria-label="Search"
      >
        <img
          src={searchIcon}
          className="svg-filter"
          draggable="false"
          title="Search"
          alt=""
          style={{ width: 28, height: 28 }}
        />
      </button>
      <AnimatePresence>
        {showSearchBar && (
          <motion.div
            id="searchInputWrapper"
            className="icon-input-wrapper"
            onBlur={() => {
              if (isValidSearchString(searchBarRef.current?.value ?? '')) return;

              closeSearchBar();
            }}
          >
            <motion.input
              id="searchInput"
              type="text"
              placeholder="Search"
              autoFocus
              ref={searchBarRef}
              className="large-input"
              onChange={(e) => {
                if (e.currentTarget.value === '') {
                  dispatch(updateSearchQuery(''));
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  dispatch(updateSearchQuery(e.currentTarget.value));
                }

                if (e.key === 'Escape') {
                  closeSearchBar();
                }
              }}
              style={{ width }}
              {...searchBarAnimationProps}
            />
            <motion.button
              id="cancelSearchButton"
              type="button"
              onClick={closeSearchBar}
              aria-label="Cancel search"
              {...cancelButtonAnimationProps}
            >
              <img
                src={cancelIcon}
                className="svg-filter"
                draggable="false"
                title="Cancel search"
                alt=""
                style={{ width: 16, height: 16 }}
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const openSearchBarStyle = {
  width: '190px',
  marginLeft: 6,
  padding: '10px 32px 10px 10px',
  opacity: 1,
};
