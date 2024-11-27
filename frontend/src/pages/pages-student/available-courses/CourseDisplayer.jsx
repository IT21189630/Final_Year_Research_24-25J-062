import React, { Component, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import "./course-displayer.styles.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import Slider from "react-slick";
import ErrorPage from "../../error-page/ErrorPage";
import CourseCard from "../../../components/course-card/CourseCard";
import LoadingScreen from "../../../components/loading-screen/LoadingScreen";
import axiosInstanceLessonMangement from "../../../axios/axiosInstanceLessonMangement";

function CourseDisplayer() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  function SampleNextArrow(props) {
    const { onClick } = props;
    return (
      <div className="slider-left-arr" onClick={onClick}>
        <IoIosArrowBack />
      </div>
    );
  }

  function SamplePrevArrow(props) {
    const { onClick } = props;
    return (
      <div className="slider-right-arr" onClick={onClick}>
        <IoIosArrowForward />
      </div>
    );
  }

  const settings = {
    dots: true,
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "50px",
    slidesToShow: 3,
    speed: 500,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  function CustomSlide(props) {
    const { index, course } = props;
    return <CourseCard {...course} index={index} />;
  }

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axiosInstanceLessonMangement.get("/courses");
      if (response.data) {
        setCourses(response.data);
        setLoading(false);
      }
    } catch (error) {
      setError(true);
      toast.error("Courses could not be fetched!");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <>
      <LoadingScreen />
      <div className="course-displayer-page-container">
        <div className="filter-container"></div>
        <div className="course-content-container">
          <span className="page-headline">Available Courses</span>
          {error || loading ? (
            <ErrorPage />
          ) : (
            <div className="course-slider-container">
              <div className="slider-container">
                <Slider {...settings}>
                  {courses.map((course, index) => {
                    return (
                      <CustomSlide key={index} course={course} index={index} />
                    );
                  })}
                </Slider>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CourseDisplayer;
