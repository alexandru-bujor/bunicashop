import React from "react";

function InfoFeature() {
    return (
        <section className="featureInfo mt-3">
            <div className="container-xxl">
                <div className="row justify-content-center">
                    <div className="col-md-6 offset-md-3">
                        <div className="feature-itm">
                            <h6><img src="https://dashboard.topmag.md/assets/images/icons/check.png" loading="lazy"
                                     height="20" width="20" alt="TopMag"/>Plată sigură</h6>
                            <p>
                                Achitați când primiți <br/>produsul.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default InfoFeature;