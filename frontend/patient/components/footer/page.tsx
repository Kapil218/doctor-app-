import React from "react";
import Image from "next/image";
import style from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={style.container}>
      <div className={style.wrapper}>
        <div className={style.copyright}>
          © EmScripts 2024. All Right Reserved.
        </div>
        <div className={style.contacts}>
          <Image
            src="./whatsapp.svg"
            alt="whatsapp"
            width={24}
            height={24}
            priority
          ></Image>

          <Image
            src="./phone.svg"
            alt="phone"
            width={24}
            height={24}
            priority
          ></Image>
        </div>
      </div>
    </footer>
  );
}
