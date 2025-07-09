Here's the fixed script with all missing closing brackets added:

```javascript
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.year ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="ex: 2023"
										min="1990"
										max={new Date().getFullYear() + 1}
									/>
									{errors.year && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.year}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Kilometraj *
									</label>
									<input
										type="number"
										value={formData.mileage}
										onChange={(e) =>
											handleInputChange("mileage", e.target.value)
										}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.mileage ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="ex: 15000"
										min="0"
										max="500000"
									/>
									{errors.mileage && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.mileage}
										</p>
									)}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CreateListingPage;
```
