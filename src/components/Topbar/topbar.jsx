import { FaPhoneAlt } from "react-icons/fa";
import "./Topbar.css";

const Topbar = () => {
    return (
        <div className="topbar">
            <div className="container">
                <div className="topbar-content">
                    <span className="delivery-message">
                        Livrare fulger prin Chișinău – comanzi azi, primești azi!
                    </span>
                    <div className="phone-numbers">
                        <span className="phone-item">
                            <FaPhoneAlt /> 079155444
                        </span>
                        <span className="phone-item">
                            <FaPhoneAlt className="red-phone" /> 079105544
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
