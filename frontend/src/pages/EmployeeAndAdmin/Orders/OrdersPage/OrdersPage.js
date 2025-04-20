import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DefaultHeader from "../../../../components/Headers/DeaultHeader";
import CitySelector from "../../../../components/Selectors/CitySelector";
import ShowingSelector from "../../../../components/Selectors/ShowingSelector";
import DaySelector from "../../../../components/DaySelector/DaySelector";
import TypeSelector from "../../../../components/Selectors/TypeSelector";
import HourSelector from "../../../../components/Selectors/HourSelector";
import OrdersDetails from "../../../../components/OrdersShowingsDetails/OrdersDetails";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { formatDate2 } from "../../../../utils/formatDate2";
import "./OrdersPage.css";
import "../../../../App.css";

function OrdersPage() {
  const navigate = useNavigate();

  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citiesLoaded, setCitiesLoaded] = useState(true);

  const [showings, setShowings] = useState([]);
  const [showingsLoading, setShowingsLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [selectedCity, setSelectedCity] = useState(
    localStorage.getItem("selectedCity") || "Warszawa"
  );
  const [selectedCinemaId, setSelectedCinemaId] = useState(null);
  const [selectedShowing, setSelectedShowing] = useState(
    localStorage.getItem("selectedShowing") || ""
  );
  const [selectedType, setSelectedType] = useState(
    localStorage.getItem("selectedType") || "normal"
  );
  const [selectedHour, setSelectedHour] = useState(() => {
    const stored = localStorage.getItem("selectedHour");
    try {
      return stored ? JSON.parse(stored) : "";
    } catch {
      return "";
    }
  });

  const [error, setError] = useState(null);

  const selectedShowingObj = showings.find((s) => s.name === selectedShowing);
  const availableHours = selectedShowingObj?.showings || [];

  const getInitialDate = () => {
    const storedDate = localStorage.getItem("selectedDateOrders");
    if (storedDate) return storedDate;
    const today = new Date();
    return formatDate2(today);
  };

  const [selectedDateOrders, setSelectedDateOrders] = useState(
    getInitialDate()
  );

  const getAuth = () => {
    try {
      const auth = JSON.parse(localStorage.getItem("authData"));
      if (!auth?.token) return null;

      const tokenParts = auth.token.split(".");
      if (tokenParts.length !== 3) return null;

      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp < currentTime) return null;

      return auth;
    } catch {
      return null;
    }
  };

  const auth = getAuth();
  const isUser = auth?.role === "USER";
  const isEmployee = auth?.role === "EMPLOYEE";
  const isAdmin = auth?.role === "ADMIN";

  useEffect(() => {
    const noAuthOrUser = !auth || isUser;

    if (noAuthOrUser) {
      navigate("/error");
    }
  }, [navigate]);

  useEffect(() => {
    async function fetchCities() {
      try {
        setCitiesLoading(true);
        const response = await fetch("http://localhost:5000/api/cities");
        if (response.ok) {
          const data = await response.json();
          setCities(data);
          const storedCity = localStorage.getItem("selectedCity");
          const initialCity = storedCity || data[0].name;
          setSelectedCity(initialCity);
          const selected = data.find((c) => c.name === initialCity);
          if (selected) {
            setSelectedCinemaId(selected.id);
          }
          setCitiesLoaded(true);
        } else {
          console.error("Nie udało się pobrać miast");
        }
      } catch (error) {
        console.error("Błąd przy pobieraniu miast:", error);
      } finally {
        setCitiesLoading(false);
      }
    }

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchShowings = async () => {
      if (
        !citiesLoaded ||
        !selectedDateOrders ||
        !selectedCinemaId ||
        !selectedType
      )
        return;

      try {
        setShowingsLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/showings?date=${selectedDateOrders}&type=${selectedType}&cinema_id=${selectedCinemaId}`
        );

        const responseText = await response.text();
        if (response.ok) {
          const data = JSON.parse(responseText);
          setShowings(data);

          const storedShowing = localStorage.getItem("selectedShowing");
          const matching = data.find((s) => s.name === storedShowing);

          if (matching) {
            setSelectedShowing(matching.name);

            let storedHour;
            try {
              const storedHourStr = localStorage.getItem("selectedHour");
              storedHour = storedHourStr ? JSON.parse(storedHourStr) : null;
            } catch (e) {
              storedHour = null;
            }

            if (storedHour && storedHour.id) {
              const matchingHour = matching.showings.find(
                (h) => h.id === storedHour.id
              );
              if (matchingHour) {
                setSelectedHour({ ...matchingHour });
                localStorage.setItem(
                  "selectedHour",
                  JSON.stringify(matchingHour)
                );
              } else if (matching.showings.length > 0) {
                setSelectedHour({ ...matching.showings[0] });
                localStorage.setItem(
                  "selectedHour",
                  JSON.stringify(matching.showings[0])
                );
              } else {
                setSelectedHour("");
                localStorage.removeItem("selectedHour");
              }
            } else if (matching.showings.length > 0) {
              setSelectedHour({ ...matching.showings[0] });
              localStorage.setItem(
                "selectedHour",
                JSON.stringify(matching.showings[0])
              );
            } else {
              setSelectedHour("");
              localStorage.removeItem("selectedHour");
            }
          } else if (data.length > 0) {
            setSelectedShowing(data[0].name);
            localStorage.setItem("selectedShowing", data[0].name);

            if (data[0].showings.length > 0) {
              setSelectedHour({ ...data[0].showings[0] });
              localStorage.setItem(
                "selectedHour",
                JSON.stringify(data[0].showings[0])
              );
            } else {
              setSelectedHour("");
              localStorage.removeItem("selectedHour");
            }
          } else {
            setSelectedShowing("");
            setSelectedHour("");
            localStorage.removeItem("selectedShowing");
            localStorage.removeItem("selectedHour");
          }
        } else {
          setShowings([]);
          setSelectedShowing("");
          setSelectedHour("");
          localStorage.removeItem("selectedShowing");
          localStorage.removeItem("selectedHour");
        }
      } catch (error) {
        console.error("Błąd przy pobieraniu pokazów:", error);
        setShowings([]);
        setSelectedShowing("");
        setSelectedHour("");
      } finally {
        setShowingsLoading(false);
      }
    };

    fetchShowings();
  }, [selectedDateOrders, selectedCinemaId, selectedType, citiesLoaded]);

  useEffect(() => {
    if (selectedShowing) {
      const showing = showings.find((s) => s.name === selectedShowing);
      if (showing && showing.showings.length > 0) {
        if (
          !selectedHour ||
          !selectedHour.id ||
          !showing.showings.some((h) => h.id === selectedHour.id)
        ) {
          console.log(
            "Setting new hour from showing change:",
            showing.showings[0]
          );
          setSelectedHour({ ...showing.showings[0] });
          localStorage.setItem(
            "selectedHour",
            JSON.stringify(showing.showings[0])
          );
        }
      } else {
        setSelectedHour("");
        localStorage.removeItem("selectedHour");
      }
    }
  }, [selectedShowing, showings]);

  useEffect(() => {
    const fetchOrders = async () => {
      console.log("fetchOrders called with hour:", selectedHour);

      if (!selectedHour || !selectedHour.id) {
        console.log("No valid hour selected, skipping order fetch");
        return;
      }

      setError(null);
      setOrders([]);

      const token = JSON.parse(localStorage.getItem("authData"))?.token;
      if (!token) {
        setError("Brak tokenu autoryzacyjnego. Zaloguj się ponownie.");
        return;
      }

      try {
        setOrdersLoading(true);
        console.log("Fetching orders for showing ID:", selectedHour.id);
        const response = await fetch(
          `http://localhost:5000/api/employee_admin_orders?showing_id=${selectedHour.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Orders received:", data);
          setOrders(data);
        } else {
          const errorText = await response.text();
          console.error("Błąd serwera", errorText);
          setError(`Błąd serwera: ${errorText}`);
        }
      } catch (error) {
        console.error("Błąd pobierania danych:", error);
        setError(`Błąd pobierania danych: ${error.message}`);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [selectedHour]);

  console.log(selectedHour);

  const handleCityChange = (event) => {
    const cityName = event.target.value;
    setSelectedCity(cityName);
    localStorage.setItem("selectedCity", cityName);

    const selected = cities.find((c) => c.name === cityName);
    if (selected) {
      setSelectedCinemaId(selected.id);
    }
  };
  const handleShowingChange = (event) => {
    const showingName = event.target.value;
    setSelectedShowing(showingName);
    localStorage.setItem("selectedShowing", showingName);

    const showing = showings.find((s) => s.name === showingName);
    if (showing && showing.showings.length > 0) {
      if (!showing.showings.includes(selectedHour)) {
        setSelectedHour(showing.showings[0]);
        localStorage.setItem("selectedHour", showing.showings[0]);
      }
    } else {
      setSelectedHour("");
      localStorage.removeItem("selectedHour");
    }
  };

  const handleTypeChange = (event) => {
    const type = event.target.value;
    setSelectedType(type);
    localStorage.setItem("selectedType", type);
  };

  const handleHourChange = (hourObj) => {
    setSelectedHour({ ...hourObj });
    localStorage.setItem("selectedHour", JSON.stringify(hourObj));
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <DefaultHeader />

      {citiesLoading ? (
        <div className="spinner">
          <AiOutlineLoading3Quarters className="loading-icon" />
        </div>
      ) : (
        <>
          <CitySelector
            cities={cities}
            selectedCity={selectedCity}
            onCityChange={handleCityChange}
          />
          <DaySelector
            selectedDate={selectedDateOrders}
            onDateChange={(date) => {
              const formatted = formatDate2(date);
              setSelectedDateOrders(formatted);
              localStorage.setItem("selectedDateOrders", formatted);
            }}
          />
          {!showingsLoading && (
            <div className="selector-row">
              <ShowingSelector
                showings={showings}
                selectedShowing={selectedShowing}
                onShowingChange={handleShowingChange}
              />
              <TypeSelector
                types={["normal", "school"]}
                selectedType={selectedType}
                onTypeChange={handleTypeChange}
              />
              <HourSelector
                hours={availableHours}
                selectedHour={selectedHour}
                onHourChange={handleHourChange}
              />
            </div>
          )}
        </>
      )}

      <div className="orders-list">
        {showingsLoading && ordersLoading && !orders ? (
          <div className="spinner">
            <AiOutlineLoading3Quarters className="loading-icon" />
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : orders.length > 0 ? (
          orders.map((order, index) => (
            <OrdersDetails
              key={index}
              order={order}
              editPath={
                isEmployee
                  ? "/employee/orders/edit"
                  : isAdmin
                  ? "/admin/orders/edit"
                  : "/home"
              }
              deletePath={
                isEmployee
                  ? "/employee/orders/delete"
                  : isAdmin
                  ? "/admin/orders/delete"
                  : "/home"
              }
              showingType={selectedType}
              showing_date={selectedDateOrders}
              showing_hour={selectedHour?.hour}
            />
          ))
        ) : (
          !showingsLoading &&
          !citiesLoading &&
          selectedHour && (
            <div className="no-orders-message">
              Brak zamówień dla wybranych kryteriów
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
