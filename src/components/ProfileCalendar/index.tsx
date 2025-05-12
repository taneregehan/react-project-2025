import ProfileCard from "../Profile";
import CalendarContainer from "../Calendar";
import { useSelector, useDispatch } from "react-redux";
import { getAuthUser } from "../../store/auth/selector";
import { getSchedule } from "../../store/schedule/selector";
import { useEffect } from "react";
import { fetchSchedule } from "../../store/schedule/actions";
import { setProfile } from "../../store/auth/actions";

import "../profileCalendar.scss";

const ProfileCalendar = () => {
  const dispatch = useDispatch();

  const auth = useSelector(getAuthUser);
  const schedule = useSelector(getSchedule);

  useEffect(() => {
    dispatch(setProfile());
    dispatch(fetchSchedule());
  }, [dispatch]);

  return (
    <div className="profile-calendar-container">
      <ProfileCard profile={auth} />
      <CalendarContainer schedule={schedule} auth={auth} />
    </div>
  );
};

export default ProfileCalendar;
