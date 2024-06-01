import { MouseEvent, ReactElement, useEffect, useState } from "react";
import {
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  Menu,
  Radio,
  RadioGroup,
} from "@mui/material";

import SwapVertIcon from "@mui/icons-material/SwapVert";
import { sortingData } from "helpers/static-data";
import { useLocation, useNavigate } from "react-router-dom";
import useProduct from "hooks/use-product";

export function Sorting(): ReactElement {
  const { sortProducts, sortValue, setSort } = useProduct();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const [sortName, setSortName] = useState("Produnct sorting");

  function getSortQuery(value: string): null | string {
    if (value !== "default") {
      const currentSort = sortingData.find((sort) => sort.value === value);
      if (currentSort) {
        return `sort=${currentSort.query}`;
      }
    }
    return null;
  }

  const changeButton = (value: string): void => {
    const currentSort = sortingData.find((sort) => sort.value === value);
    if (currentSort) {
      const buttonName =
        value !== "default" ? currentSort.label : "Produnct sorting";
      setSortName(buttonName);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    setSort(value);

    let querySearch = search;

    if (search.includes("sort")) {
      const [searchItem] = querySearch.split("&");
      querySearch = searchItem.includes("sort") ? "" : searchItem;
    }

    const urlPath = `${pathname}${querySearch}`;
    const querySymbol = querySearch ? "&" : "?";

    const queryValue = getSortQuery(value);

    if (queryValue) {
      navigate(`${urlPath}${querySymbol}${queryValue}`);
    } else {
      navigate(`${urlPath}`);
    }
    sortProducts(value);
  };

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  useEffect(() => {
    changeButton(sortValue);
  }, [sortValue]);

  return (
    <Grid
      item
      md={4}
      xs={12}
      sx={{
        display: "flex",
        alignSelf: "flex-end",
        justifyContent: "flex-end",
        "@media (max-width: 510px)": {
          justifyContent: "flex-start",
        },
      }}
    >
      <Button
        onClick={handleClick}
        variant="outlined"
        color="success"
        startIcon={<SwapVertIcon />}
      >
        {sortName}
      </Button>
      <Menu
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        anchorEl={anchorEl}
      >
        <FormControl sx={{ p: 1 }}>
          <RadioGroup value={sortValue} onChange={handleChange}>
            {sortingData.map(({ label, value }) => {
              return (
                <FormControlLabel
                  key={value}
                  value={value}
                  control={<Radio />}
                  name={label}
                  label={label}
                />
              );
            })}
          </RadioGroup>
        </FormControl>
      </Menu>
    </Grid>
  );
}