import { MessageEnum } from "../whatsapp/whatsapp.functions";

export class Customer {
  #id: number;
  #name: string;
  #number: string;
  #userActive: number | null;
  #messageType: MessageEnum;
  #last_messages: any[];

  constructor(
    id: number,
    name: string,
    number: string,
    last_messages: any[],
    messageType: MessageEnum = MessageEnum.FIRST_CONTACT,
    userActive: number | null
  ) {
    this.#id = id;
    this.#name = name;
    this.#number = number;
    this.#last_messages = last_messages;
    this.#userActive = userActive;
    this.#messageType = messageType;
  }

  getName() {
    return this.#name;
  }

  getNumber() {
    return this.#number;
  }

  getUserActive() {
    return this.#userActive;
  }

  setMessageType(type: MessageEnum) {
    this.#messageType = type;
  }

  getMessageType(): MessageEnum {
    return this.#messageType;
  }

  getId(): number {
    return this.#id;
  }

  getLastMessages(): any[] {
    return this.#last_messages;
  }

  setUserActive(id: number) {
    this.#userActive = id;
  }

  setName(name: string) {
    this.#name = name;
  }

  getCustomer() {
    return {
      id: this.#id,
      number: this.#number,
      name: this.#name
    };
  }
}
