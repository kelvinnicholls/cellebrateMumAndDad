export class OrderByOption {
  constructor(public field: string
    , public description: string
    , public type: OrderByDataTypeEnum = OrderByDataTypeEnum.String
    , public isDefault : Boolean = false) { }
}


export enum OrderByDataTypeEnum {
  String,
  Date
}

export enum OrderByDirectionEnum {
  Ascending = "Ascending",
  Descending = "Descending"
}