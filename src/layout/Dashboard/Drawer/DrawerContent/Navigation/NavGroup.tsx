
import {
  ComponentType,
  Fragment,
  useEffect,
  useState
} from 'react';

import {
  matchPath,
  useLocation
} from 'react-router-dom';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// third-party
import { FormattedMessage } from 'react-intl';

// project import
import DownOutlined from '@ant-design/icons/DownOutlined';
import GroupOutlined from '@ant-design/icons/GroupOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';

import NavCollapse from './NavCollapse';
import NavItem from './NavItem';

import SimpleBar from 'components/thirdParty/SimpleBar';
import Transitions from 'components/@extended/Transitions';

import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import { useGetMenuMaster } from 'api/menu';

// types
import { NavItemType } from 'types/menu';

// ==============================|| TYPES ||============================== //

interface Props {
  item: NavItemType;

  lastItem: number;

  remItems: NavItemType[];

  lastItemId: string;

  setSelectedID: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;

  selectedID: string | undefined;

  setSelectedItems: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;

  selectedItems: string | undefined;

  setSelectedLevel: React.Dispatch<
    React.SetStateAction<number>
  >;

  selectedLevel: number;
}

type VirtualElement = {
  getBoundingClientRect: () => ClientRect | DOMRect;
  contextElement?: Element;
};

// ==============================|| POPPER ||============================== //

const PopperStyled = styled(Popper)(({ theme }) => ({
  overflow: 'visible',
  zIndex: 1202,
  minWidth: 200,

  '&:before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    top: 5,
    left: 32,
    width: 12,
    height: 12,
    transform: 'translateY(-50%) rotate(45deg)',
    zIndex: 120,

    borderWidth: '6px',
    borderStyle: 'solid',

    borderColor: `${theme.palette.background.paper} transparent transparent ${theme.palette.background.paper}`
  }
}));

// ==============================|| NAV GROUP ||============================== //

export default function NavGroup({
  item,
  lastItem,
  remItems,
  lastItemId,
  selectedID,
  setSelectedID,
  setSelectedItems,
  selectedItems,
  setSelectedLevel,
  selectedLevel
}: Props) {
  const theme = useTheme();

  const { pathname } = useLocation();

  const { menuOrientation } = useConfig();

  const { menuMaster } = useGetMenuMaster();

  const drawerOpen =
    menuMaster.isDashboardDrawerOpened;

  const downLG = useMediaQuery(
    theme.breakpoints.down('lg')
  );

  // ==============================|| STATE ||============================== //

  const [anchorEl, setAnchorEl] = useState<
    VirtualElement |
    (() => VirtualElement) |
    null |
    undefined
  >(null);

  const [currentItem, setCurrentItem] =
    useState<NavItemType>(item);

  /**
   * Vertical sidebar open state.
   */
  const [isOpen, setIsOpen] =
    useState<boolean>(false);

  // ==============================|| MENU MODE ||============================== //

  const isVertical =
    menuOrientation === MenuOrientation.VERTICAL ||
    downLG;

  const openMini = Boolean(anchorEl);

  // ==============================|| CURRENT ITEM ||============================== //

  useEffect(() => {
    if (lastItem) {
      if (item.id === lastItemId) {
        const localItem: NavItemType = {
          ...item
        };

        const elements = remItems.flatMap(
          (ele) => ele.elements ?? []
        );

        localItem.children = elements;

        setCurrentItem(localItem);
      } else {
        setCurrentItem(item);
      }
    } else {
      setCurrentItem(item);
    }
  }, [
    item,
    lastItem,
    lastItemId,
    remItems,
    downLG
  ]);

  // ==============================|| CHECK ACTIVE ROUTE ||============================== //

  const hasActiveChild = (
    children: NavItemType[] = []
  ): boolean => {
    return children.some((child) => {
      if (
        child.url &&
        matchPath(
          {
            path: child.link
              ? child.link
              : child.url,
            end: true
          },
          pathname
        )
      ) {
        return true;
      }

      if (child.children?.length) {
        return hasActiveChild(
          child.children
        );
      }

      return false;
    });
  };

  // ==============================|| CHECK OPEN PARENT ||============================== //

  const checkOpenForParent = (
    children: NavItemType[],
    id: string
  ) => {
    children.forEach(
      (child: NavItemType) => {
        if (child.children?.length) {
          checkOpenForParent(
            child.children,
            id
          );
        }

        if (
          child.url &&
          !!matchPath(
            {
              path: child.link
                ? child.link
                : child.url,
              end: true
            },
            pathname
          )
        ) {
          setSelectedID(id);
        }
      }
    );
  };

  // ==============================|| CHECK SELECTED ON LOAD ||============================== //

  const checkSelectedOnload = (
    data: NavItemType
  ) => {
    const children =
      data.children ?? [];

    children.forEach(
      (itemCheck: NavItemType) => {
        if (itemCheck.children?.length) {
          checkOpenForParent(
            itemCheck.children,
            currentItem.id
          );
        }

        if (
          itemCheck.url &&
          !!matchPath(
            {
              path: itemCheck.link
                ? itemCheck.link
                : itemCheck.url,
              end: true
            },
            pathname
          )
        ) {
          setSelectedID(
            currentItem.id
          );
        }
      }
    );
  };

  // ==============================|| ACTIVE ROUTE EFFECT ||============================== //

  useEffect(() => {
    checkSelectedOnload(
      currentItem
    );

    /**
     * Automatically open the group
     * if one of its children matches
     * the current route.
     */
    if (
      isVertical &&
      hasActiveChild(
        currentItem.children
      )
    ) {
      setIsOpen(true);
    }

    /**
     * Close horizontal popper
     * after route change.
     */
    if (openMini) {
      setAnchorEl(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pathname,
    currentItem,
    isVertical
  ]);

  // ==============================|| VERTICAL TOGGLE ||============================== //

  const handleVerticalClick = () => {
    /**
     * Toggle the current group.
     *
     * OPEN  -> CLOSED
     * CLOSED -> OPEN
     */
    setIsOpen(
      (previous) => !previous
    );

    setSelectedID(
      currentItem.id
    );
  };

  // ==============================|| HORIZONTAL MENU ||============================== //

  const handleHorizontalClick = (
    event:
      | React.MouseEvent<HTMLAnchorElement>
      | React.MouseEvent<HTMLDivElement>
      | undefined
  ) => {
    if (!openMini) {
      setAnchorEl(
        event?.currentTarget
      );
    } else {
      setAnchorEl(null);
    }

    setSelectedID(
      currentItem.id
    );
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // ==============================|| ICON ||============================== //

  const isSelected =
    selectedID === currentItem.id;

  type IconProps = {
    style?: React.CSSProperties;
  };

  const IconComponent =
    currentItem.icon as
      | ComponentType<IconProps>
      | null;

  const itemIcon = IconComponent ? (
    <IconComponent
      style={{
        fontSize: 20,
        stroke: '1.5',
        color: isSelected
          ? theme.palette.primary.main
          : theme.palette.secondary.dark
      }}
    />
  ) : null;

  // ==============================|| CHILDREN ||============================== //

  const renderChildren = () => {
    return currentItem.children?.map(
      (menuItem) => {
        switch (menuItem.type) {
          case 'collapse':
            return (
              <NavCollapse
                key={menuItem.id}
                menu={menuItem}
                setSelectedItems={
                  setSelectedItems
                }
                setSelectedLevel={
                  setSelectedLevel
                }
                selectedLevel={
                  selectedLevel
                }
                selectedItems={
                  selectedItems
                }
                level={1}
                parentId={
                  currentItem.id
                }
              />
            );

          case 'item':
            return (
              <NavItem
                key={menuItem.id}
                item={menuItem}
                level={1}
              />
            );

          default:
            return (
              <Typography
                key={menuItem.id}
                variant="h6"
                color="error"
                align="center"
              >
                Menu Items Error
              </Typography>
            );
        }
      }
    );
  };

  // ==============================|| MORE ITEMS ||============================== //

  const moreItems = remItems.map(
    (
      itemRem: NavItemType,
      i
    ) => (
      <Fragment key={i}>
        {itemRem.url ? (
          <NavItem
            item={itemRem}
            level={1}
          />
        ) : (
          itemRem.title && (
            <Typography
              variant="caption"
              sx={{
                pl: 2
              }}
            >
              {itemRem.title}
            </Typography>
          )
        )}

        {itemRem?.elements?.map(
          (menu) => {
            switch (menu.type) {
              case 'collapse':
                return (
                  <NavCollapse
                    key={menu.id}
                    menu={menu}
                    level={1}
                    parentId={
                      currentItem.id
                    }
                    setSelectedItems={
                      setSelectedItems
                    }
                    setSelectedLevel={
                      setSelectedLevel
                    }
                    selectedLevel={
                      selectedLevel
                    }
                    selectedItems={
                      selectedItems
                    }
                  />
                );

              case 'item':
                return (
                  <NavItem
                    key={menu.id}
                    item={menu}
                    level={1}
                  />
                );

              default:
                return (
                  <Typography
                    key={menu.id}
                    variant="h6"
                    color="error"
                    align="center"
                  >
                    Menu Items Error
                  </Typography>
                );
            }
          }
        )}
      </Fragment>
    )
  );

  // ==============================|| HORIZONTAL ITEMS ||============================== //

  const items =
    currentItem.children?.map(
      (menu) => {
        switch (menu?.type) {
          case 'collapse':
            return (
              <NavCollapse
                key={menu.id}
                menu={menu}
                level={1}
                parentId={
                  currentItem.id
                }
                setSelectedItems={
                  setSelectedItems
                }
                setSelectedLevel={
                  setSelectedLevel
                }
                selectedLevel={
                  selectedLevel
                }
                selectedItems={
                  selectedItems
                }
              />
            );

          case 'item':
            return (
              <NavItem
                key={menu.id}
                item={menu}
                level={1}
              />
            );

          default:
            return (
              <Typography
                key={menu?.id}
                variant="h6"
                color="error"
                align="center"
              >
                Menu Items Error
              </Typography>
            );
        }
      }
    );

  // ==============================|| POPPER ID ||============================== //

  const popperId =
    openMini
      ? `group-pop-${item.id}`
      : undefined;

  // ==============================|| VERTICAL SIDEBAR ||============================== //

  if (isVertical) {
    const groupTitle =
      currentItem.id === lastItemId ? (
        <FormattedMessage
          id="more-items"
          defaultMessage="More"
        />
      ) : (
        currentItem.title
      );

    // ==============================|| COLLAPSED SIDEBAR ||============================== //

    if (!drawerOpen) {
      return (
        <List
          component="div"
          disablePadding
          sx={{
            width: '100%',
            py: 0
          }}
        >
          <Tooltip
            title={groupTitle}
            placement="right"
            arrow
          >
            <ListItemButton
              selected={isSelected}
              onClick={
                handleVerticalClick
              }
              sx={{
                width: 44,
                height: 44,
                minHeight: 44,

                mx: 'auto',
                my: 0.75,

                p: 0,

                borderRadius: 1.5,

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                transition:
                  'all 0.2s ease',

                '&:hover': {
                  bgcolor:
                    'primary.lighter'
                },

                '&.Mui-selected': {
                  bgcolor:
                    'primary.lighter',

                  '&:hover': {
                    bgcolor:
                      'primary.lighter'
                  }
                }
              }}
            >
              {itemIcon && (
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    width: 44,
                    height: 44,

                    m: 0,

                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',

                    flexShrink: 0
                  }}
                >
                  {currentItem.id ===
                  lastItemId ? (
                    <GroupOutlined
                      style={{
                        fontSize: 20,
                        stroke: '1.5',
                        color:
                          isSelected
                            ? theme
                                .palette
                                .primary
                                .main
                            : theme
                                .palette
                                .secondary
                                .dark
                      }}
                    />
                  ) : (
                    itemIcon
                  )}
                </ListItemIcon>
              )}
            </ListItemButton>
          </Tooltip>

          {/* 
            Do not render children when the drawer
            is collapsed.
          */}
        </List>
      );
    }

    // ==============================|| EXPANDED SIDEBAR ||============================== //

    return (
      <List
        component="div"
        disablePadding
        sx={{
          width: '100%',
          py: 0
        }}
      >
        {/* ============================== */}
        {/* GROUP HEADER */}
        {/* ============================== */}

        <ListItemButton
          selected={isSelected}
          onClick={
            handleVerticalClick
          }
          sx={{
            mx: 1,
            my: 0.5,

            minHeight: 44,

            borderRadius: 1.5,

            px: 1.5,

            display: 'flex',
            alignItems: 'center',

            transition:
              'all 0.2s ease',

            '&:hover': {
              bgcolor:
                'primary.lighter'
            },

            '&.Mui-selected': {
              bgcolor:
                'primary.lighter',

              '&:hover': {
                bgcolor:
                  'primary.lighter'
              }
            }
          }}
        >
          {/* ============================== */}
          {/* ICON */}
          {/* ============================== */}

          {itemIcon && (
            <ListItemIcon
              sx={{
                minWidth: 38,
                width: 38,

                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',

                flexShrink: 0,

                mr: 0.5
              }}
            >
              {currentItem.id ===
              lastItemId ? (
                <GroupOutlined
                  style={{
                    fontSize: 20,
                    stroke: '1.5'
                  }}
                />
              ) : (
                itemIcon
              )}
            </ListItemIcon>
          )}

          {/* ============================== */}
          {/* TITLE */}
          {/* ============================== */}

          <ListItemText
            primary={
              <Typography
                variant="body1"
                fontWeight={
                  isSelected
                    ? 600
                    : 500
                }
                color={
                  isSelected
                    ? 'primary.main'
                    : 'text.primary'
                }
                noWrap
              >
                {groupTitle}
              </Typography>
            }
            sx={{
              my: 0,
              minWidth: 0
            }}
          />

          {/* ============================== */}
          {/* ARROW */}
          {/* ============================== */}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              ml: 1,

              flexShrink: 0
            }}
          >
            {isOpen ? (
              <DownOutlined
                style={{
                  fontSize: 13,
                  stroke: '1.5'
                }}
              />
            ) : (
              <RightOutlined
                style={{
                  fontSize: 13,
                  stroke: '1.5'
                }}
              />
            )}
          </Box>
        </ListItemButton>

        {/* ============================== */}
        {/* CHILDREN */}
        {/* ============================== */}

        <Collapse
          in={isOpen}
          timeout="auto"
          unmountOnExit
        >
          <List
            component="div"
            disablePadding
            sx={{
              width: '100%',

              /**
               * Slight indentation so the
               * children visually belong to
               * the parent section.
               */
              pl: 2,

              pr: 1
            }}
          >
            {renderChildren()}
          </List>
        </Collapse>
      </List>
    );
  }

  // ==============================|| HORIZONTAL MENU ||============================== //

  return (
    <List>
      <ListItemButton
        selected={isSelected}
        sx={{
          p: 1,
          my: 0.5,
          mr: 1,

          display: 'flex',
          alignItems: 'center',

          '&.Mui-selected': {
            bgcolor:
              'transparent'
          }
        }}
        onMouseEnter={
          handleHorizontalClick
        }
        onClick={
          handleHorizontalClick
        }
        onMouseLeave={
          handleClose
        }
        aria-describedby={
          popperId
        }
      >
        {/* ============================== */}
        {/* ICON */}
        {/* ============================== */}

        {itemIcon && (
          <ListItemIcon
            sx={{
              minWidth: 28
            }}
          >
            {currentItem.id ===
            lastItemId ? (
              <GroupOutlined
                style={{
                  fontSize: 20,
                  stroke: '1.5'
                }}
              />
            ) : (
              itemIcon
            )}
          </ListItemIcon>
        )}

        {/* ============================== */}
        {/* TITLE */}
        {/* ============================== */}

        <ListItemText
          sx={{
            mr: 1
          }}
          primary={
            <Typography
              variant="body1"
              color={
                isSelected
                  ? 'primary.main'
                  : 'secondary.dark'
              }
            >
              {currentItem.id ===
              lastItemId ? (
                <FormattedMessage
                  id="more-items"
                  defaultMessage="More"
                />
              ) : (
                currentItem.title
              )}
            </Typography>
          }
        />

        {/* ============================== */}
        {/* ARROW */}
        {/* ============================== */}

        {openMini ? (
          <DownOutlined
            style={{
              fontSize: 16,
              stroke: '1.5'
            }}
          />
        ) : (
          <RightOutlined
            style={{
              fontSize: 16,
              stroke: '1.5'
            }}
          />
        )}

        {/* ============================== */}
        {/* POPPER */}
        {/* ============================== */}

        {anchorEl && (
          <PopperStyled
            id={popperId}
            open={openMini}
            anchorEl={anchorEl}
            placement="bottom-start"
            style={{
              zIndex: 2001
            }}
          >
            {({
              TransitionProps
            }) => (
              <Transitions
                in={openMini}
                {...TransitionProps}
              >
                <Paper
                  sx={{
                    mt: 0.5,
                    py: 1.25,

                    boxShadow:
                      theme.shadows[8],

                    backgroundImage:
                      'none'
                  }}
                >
                  <ClickAwayListener
                    onClickAway={
                      handleClose
                    }
                  >
                    <SimpleBar
                      sx={{
                        minWidth: 200,

                        overflowX:
                          'hidden',

                        overflowY:
                          'auto',

                        maxHeight:
                          'calc(100vh - 170px)'
                      }}
                    >
                      {currentItem.id !==
                      lastItemId
                        ? items
                        : moreItems}
                    </SimpleBar>
                  </ClickAwayListener>
                </Paper>
              </Transitions>
            )}
          </PopperStyled>
        )}
      </ListItemButton>
    </List>
  );
}

