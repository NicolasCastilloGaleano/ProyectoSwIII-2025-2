import useStore from "@/store/useStore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import PhoneIcon from "@mui/icons-material/Phone";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

const TabBar = () => {
  const { screen, setCurrentTab } = useStore((store) => store.screenState);

  return (
    <Tabs
      value={screen.currentTab}
      onChange={(_: React.SyntheticEvent, value: string) =>
        setCurrentTab(Number(value))
      }
      aria-label="tab-bar"
      variant="fullWidth"
    >
      <Tab icon={<PhoneIcon />} label="RECENTS" />
      <Tab icon={<FavoriteIcon />} label="FAVORITES" />
      <Tab icon={<PersonPinIcon />} label="NEARBY" />
    </Tabs>
  );
};

export default TabBar;
